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
  ServerEvent,
  ServerEventTypes,
} from '../event/ServerEvent';
import {
  ClientEventTypes,
  EVENT_ADD_PLAYER,
  EVENT_READY,
  EVENT_REMOVE_PLAYER,
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_UPDATE_MAIN_PLAYER,
  gameEventType,
} from '../event/ClientEvent';

export default class RoomService extends EventEmitter<
  ServerEventTypes | ClientEventTypes | string
> {
  private readonly roomId: string;

  private socketConn: WebSocket | null;

  private readonly inputHandler: InputHandler;

  private mainPlayer: Player | null;

  constructor(roomId: string) {
    super();

    this.roomId = roomId;

    this.socketConn = null;

    this.inputHandler = new InputHandler([
      new KeyboardInputAdapter(),
      new GamepadInputAdapter(),
    ]);

    this.mainPlayer = null;
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

  private sendPlayerCommand(cmd: Command): void {
    this.socketConn?.send(cmd);
  }

  public addOpenHandler(playerName: string): void {
    this.socketConn?.addEventListener('open', () => {
      console.log('socket open');

      this.addHelloListener(playerName);

      this.inputHandler.on(EVENT_INPUT_COMMAND, (cmd: Command) => {
        this.sendPlayerCommand(cmd);
      });

      //this.addKeyboardHandler();
    });
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

          if (event.origin.type === EVENT_ORIGIN_GAME) {
            this.emit(gameEventType(event.type, event.origin.id), event);
          } else if (event.origin.type === EVENT_ORIGIN_ROOM) {
            this.handleRoomEventMessage(event);
          }
        } catch (e) {
          console.error('unable to process message data', msgEvent, e);
        }
      },
    );
  }

  public connect(playerName: string): void {
    this.socketConn = new WebSocket(
      `ws://${import.meta.env.VITE_GAME_SERVER}/rooms/${this.roomId}/socket`,
    );

    this.addCloseListener();
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
    return axios
      .post(
        `http://${import.meta.env.VITE_GAME_SERVER}/rooms/${this.roomId}/start`,
      )
      .then(() => {
        return true;
      })
      .catch((reason) => {
        console.log('start request failed:', reason);

        return false;
      });
  }
}