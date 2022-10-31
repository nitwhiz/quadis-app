import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Player from '../player/Player';

import { Command } from '../command/Command';
import InputHandler, { EVENT_INPUT_COMMAND } from '../input/InputHandler';
import KeyboardInputAdapter from '../input/adapter/KeyboardInputAdapter';
import GamepadInputAdapter from '../input/adapter/GamepadInputAdapter';
import {
  EVENT_HELLO,
  EVENT_HELLO_ACK,
  EVENT_JOIN,
  EVENT_LEAVE,
  EVENT_ORIGIN_GAME,
  EVENT_ORIGIN_ROOM,
  EVENT_ORIGIN_SYSTEM,
  EVENT_WINDOW,
  ServerEvent,
  ServerEventTypes,
} from '../event/ServerEvent';
import {
  ClientEventTypes,
  EVENT_ADD_PLAYER,
  EVENT_PLAYER_COMMAND,
  EVENT_READY,
  EVENT_REMOVE_PLAYER,
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_UPDATE_MAIN_PLAYER,
  gameEventType,
} from '../event/ClientEvent';

export default class RoomService extends EventEmitter<
  ServerEventTypes | ClientEventTypes | string
> {
  private readonly gameServer: string;

  private readonly tls: boolean;

  private socketConn: WebSocket | null;

  private readonly inputHandler: InputHandler;

  private mainPlayer: Player | null;

  private roomId: string | null;

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
  }

  public setRoomId(roomId: string): void {
    this.roomId = roomId;
  }

  private addHelloListener(playerName: string) {
    const helloListener = (msgEvent: MessageEvent<string>) => {
      try {
        const event = JSON.parse(msgEvent.data) as ServerEvent;

        if (event.type === EVENT_HELLO) {
          this.socketConn?.send(
            JSON.stringify({
              playerName: playerName.toUpperCase(),
            }),
          );

          this.emit(EVENT_READY);

          this.socketConn?.removeEventListener('message', helloListener);
        }
      } catch (e) {
        console.error('unable to process hello', msgEvent, e);
      }
    };

    this.socketConn?.addEventListener('message', helloListener);
  }

  private addCloseListener(): void {
    this.socketConn?.addEventListener('close', (e) => {
      console.log('socket closed');

      if (e.reason === 'room_has_games_running') {
        this.emit(EVENT_ROOM_HAS_GAMES_RUNNING);
      }
    });
  }

  private addErrorListener(): void {
    this.socketConn?.addEventListener('error', (err) => {
      console.error('socket error', err);
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
        gameEventType(EVENT_PLAYER_COMMAND, this.mainPlayer.gameId),
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
      console.log('socket open');

      this.addHelloListener(playerName);

      this.inputHandler.on(EVENT_INPUT_COMMAND, (cmd: Command) => {
        this.handlePlayerCommand(cmd);
      });

      //this.addKeyboardHandler();
    });
  }

  private handleEvent(event: ServerEvent) {
    const now = Date.now();

    const latencyPublish = now - event.publishedAt;
    const latencySend = now - event.sentAt;

    console.log(event.type, latencyPublish, latencySend);

    if (event.origin.type === EVENT_ORIGIN_GAME) {
      this.emit(gameEventType(event.type, event.origin.id), event);
    } else if (event.origin.type === EVENT_ORIGIN_ROOM) {
      this.handleRoomEventMessage(event);
    } else if (event.origin.type === EVENT_ORIGIN_SYSTEM) {
      if (event.type === EVENT_WINDOW) {
        for (const e of event.payload.events) {
          this.handleEvent(e);
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

          if (event.type === EVENT_HELLO_ACK) {
            this.mainPlayer = new Player(
              true,
              event.payload.controlledGame.id,
              event.payload.controlledGame.playerName,
              event.payload.host,
            );

            this.emit(EVENT_UPDATE_MAIN_PLAYER, this.mainPlayer);

            for (const g of event.payload.room.games) {
              if (g.id !== this.mainPlayer.gameId) {
                this.emit(
                  EVENT_ADD_PLAYER,
                  new Player(false, g.id, g.playerName),
                );
              }
            }
          }

          this.handleEvent(event);
        } catch (e) {
          console.error('unable to process message data', msgEvent, e);
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

  private handleRoomEventMessage(event: ServerEvent): void {
    switch (event.type) {
      case EVENT_JOIN:
        {
          if (this.mainPlayer?.gameId !== event.payload.id) {
            this.emit(
              EVENT_ADD_PLAYER,
              new Player(false, event.payload.id, event.payload.playerName),
            );
          }
        }
        break;
      case EVENT_LEAVE:
        {
          this.emit(EVENT_REMOVE_PLAYER, event.payload.id);
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
        console.log('start request failed:', reason);

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
