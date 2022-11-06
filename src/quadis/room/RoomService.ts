import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Player from '../player/Player';

import { Command } from '../command/Command';
import InputHandler, { EVENT_INPUT_COMMAND } from '../input/InputHandler';
import KeyboardInputAdapter from '../input/adapter/KeyboardInputAdapter';
import GamepadInputAdapter from '../input/adapter/GamepadInputAdapter';
import {
  ServerEvent,
  ServerEventMap,
  ServerEventOrigin,
  ServerEventType,
} from '../event/ServerEvent';
import { ClientEventMap, ClientEventType } from '../event/ClientEvent';
import { GameEventType, gameEventType } from '../event/GameEvent';
import { PerformanceLogger, RoomLogger } from '../../logger/Logger';

export default class RoomService extends EventEmitter<
  ServerEventMap | ClientEventMap | GameEventType
> {
  private readonly gameServer: string;

  private readonly tls: boolean;

  private socketConn: WebSocket | null;

  private readonly inputHandler: InputHandler;

  private mainPlayer: Player | null;

  private roomId: string | null;

  private gameRunning: boolean;

  constructor(gameServer: string, tls: boolean) {
    super();

    this.gameServer = gameServer;
    this.tls = tls;

    this.roomId = null;

    this.socketConn = null;

    this.inputHandler = new InputHandler([
      new KeyboardInputAdapter(),
      new GamepadInputAdapter(),
    ]);

    this.mainPlayer = null;

    this.gameRunning = false;
  }

  public get isGameRunning() {
    return this.gameRunning;
  }

  public setRoomId(roomId: string): void {
    this.roomId = roomId;
  }

  private addHelloListener(playerName: string) {
    const helloListener = (msgEvent: MessageEvent<string>) => {
      try {
        const event = JSON.parse(msgEvent.data) as ServerEvent;

        if (event.type === ServerEventType.HELLO) {
          this.socketConn?.send(
            JSON.stringify({
              playerName: playerName.toUpperCase(),
            }),
          );

          this.emit(ClientEventType.READY);

          this.socketConn?.removeEventListener('message', helloListener);
        }
      } catch (e) {
        RoomLogger.error('unable to process hello', msgEvent, e);
      }
    };

    this.socketConn?.addEventListener('message', helloListener);
  }

  private addCloseListener(): void {
    this.socketConn?.addEventListener('close', (e) => {
      RoomLogger.debug('socket closed');

      if (e.reason === 'room_has_games_running') {
        this.emit(ClientEventType.ROOM_HAS_GAMES_RUNNING);
      }
    });
  }

  private addErrorListener(): void {
    this.socketConn?.addEventListener('error', (err) => {
      RoomLogger.error('socket error', err);
      this.socketConn?.close();
    });
  }

  private handlePlayerCommand(cmd: Command): void {
    this.runPlayerCommandLocally(cmd);
    this.sendPlayerCommand(cmd);
  }

  private runPlayerCommandLocally(cmd: Command): void {
    if (this.mainPlayer) {
      this.emit(
        gameEventType(ClientEventType.PLAYER_COMMAND, this.mainPlayer.gameId),
        cmd,
      );
    }
  }

  private sendPlayerCommand(cmd: Command): void {
    this.socketConn?.send(cmd);
  }

  public getUrl(protocol: string, path: string): string {
    return `${protocol}${this.tls ? 's' : ''}://${this.gameServer}/${path}`;
  }

  public addOpenHandler(playerName: string): void {
    this.socketConn?.addEventListener('open', () => {
      RoomLogger.debug('socket open');

      this.addHelloListener(playerName);

      this.inputHandler.on(EVENT_INPUT_COMMAND, (cmd: Command) => {
        this.handlePlayerCommand(cmd);
      });

      //this.addKeyboardHandler();
    });
  }

  private handleServerEvent(event: ServerEvent) {
    const now = Date.now();

    const latencyPublish = now - event.publishedAt;
    const latencySend = now - event.sentAt;

    PerformanceLogger.debug(event.type, latencyPublish, latencySend);

    if (event.origin.type === ServerEventOrigin.GAME) {
      this.emit(gameEventType(event.type, event.origin.id), event);

      if (
        this.mainPlayer?.gameId === event.origin.id &&
        event.type === ServerEventType.GAME_OVER
      ) {
        this.gameRunning = false;
      }
    } else if (event.origin.type === ServerEventOrigin.ROOM) {
      this.handleRoomEvent(event);

      if (event.type === ServerEventType.START) {
        this.gameRunning = true;
      }
    } else if (event.origin.type === ServerEventOrigin.SYSTEM) {
      if (event.type === ServerEventType.WINDOW) {
        for (const e of event.payload.events) {
          this.handleServerEvent(e);
        }
      }
    }
  }

  public addMessageHandler(): void {
    this.socketConn?.addEventListener(
      'message',
      (msgEvent: MessageEvent<string>) => {
        try {
          const event = JSON.parse(msgEvent.data) as ServerEvent;

          if (event.type === ServerEventType.HELLO_ACK) {
            this.mainPlayer = new Player(
              true,
              event.payload.controlledGame.id,
              event.payload.controlledGame.playerName,
              event.payload.host,
            );

            this.emit(ClientEventType.UPDATE_MAIN_PLAYER, this.mainPlayer);

            for (const g of event.payload.room.games) {
              if (g.id !== this.mainPlayer.gameId) {
                this.emit(
                  ClientEventType.ADD_PLAYER,
                  new Player(false, g.id, g.playerName),
                );
              }
            }
          }

          this.handleServerEvent(event);
        } catch (e) {
          RoomLogger.error('unable to process message data', msgEvent, e);
        }
      },
    );
  }

  public connect(playerName: string): void {
    if (!this.roomId) {
      return;
    }

    this.socketConn = new WebSocket(
      this.getUrl('ws', `rooms/${this.roomId}/socket`),
    );

    this.addCloseListener();
    this.addErrorListener();
    this.addOpenHandler(playerName);
    this.addMessageHandler();
  }

  private handleRoomEvent(event: ServerEvent): void {
    switch (event.type) {
      case ServerEventType.JOIN:
        {
          if (this.mainPlayer?.gameId !== event.payload.id) {
            this.emit(
              ClientEventType.ADD_PLAYER,
              new Player(false, event.payload.id, event.payload.playerName),
            );
          }
        }
        break;
      case ServerEventType.LEAVE:
        {
          this.emit(ClientEventType.REMOVE_PLAYER, event.payload.id);
        }
        break;
      default:
        this.emit(event.type, event);
        break;
    }
  }

  public start(): Promise<boolean> {
    if (!this.roomId) {
      return Promise.resolve(false);
    }

    return axios
      .post(this.getUrl('http', `rooms/${this.roomId}/start`))
      .then(() => {
        return true;
      })
      .catch((reason) => {
        RoomLogger.error('start request failed:', reason);

        return false;
      });
  }

  public checkRoom(): Promise<boolean> {
    if (!this.roomId) {
      return Promise.resolve(false);
    }

    return axios
      .get(this.getUrl('http', `rooms/${this.roomId}`))
      .then(() => true)
      .catch(() => {
        this.roomId = null;
        return false;
      });
  }
}
