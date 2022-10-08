import EventEmitter from 'eventemitter3';
import axios from 'axios';
import {
  EVENT_ADD_PLAYER,
  EVENT_REMOVE_PLAYER,
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_SUCCESSFUL_HELLO,
  EVENT_UPDATE_MAIN_PLAYER,
  SERVER_EVENT_GAME_OVER,
  SERVER_EVENT_GAME_START,
  SERVER_EVENT_HELLO,
  SERVER_EVENT_HELLO_ACK,
  SERVER_EVENT_PLAYER_JOIN,
  SERVER_EVENT_PLAYER_LEAVE,
  SERVER_EVENT_UPDATE_BEDROCK_TARGETS,
  specificEvent,
} from '../event/EventType';
import Player from '../player/Player';
import {
  BedrockTargetsUpdatePayload,
  HelloAckPayload,
  PlayerJoinPayload,
  PlayerLeavePayload,
  ServerEvent,
} from '../event/EventPayload';
import { Command } from '../command/Command';
import InputHandler, { EVENT_INPUT_COMMAND } from '../input/InputHandler';
import KeyboardInputAdapter from '../input/adapter/KeyboardInputAdapter';
import GamepadInputAdapter from '../input/adapter/GamepadInputAdapter';

export const CHAN_ROOM = 'room';
export const CHAN_NONE = 'none';

export default class RoomService extends EventEmitter<string> {
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
    const helloListener = (event: MessageEvent<string>) => {
      try {
        const msg = JSON.parse(event.data) as ServerEvent<unknown>;

        if (msg.type === SERVER_EVENT_HELLO) {
          this.socketConn?.send(
            JSON.stringify({
              name: playerName.toUpperCase(),
            }),
          );

          this.emit(EVENT_SUCCESSFUL_HELLO);

          this.socketConn?.removeEventListener('message', helloListener);
        }
      } catch (e) {
        console.error('unable to process hello', event, e);
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

      // todo: remove event listeners on body
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
      (event: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(event.data) as ServerEvent<unknown>;

          if (msg.type === SERVER_EVENT_HELLO_ACK) {
            const e = msg as ServerEvent<HelloAckPayload>;

            // retrieve main player as e.payload.you

            this.mainPlayer = new Player(true, e.payload.you);

            this.emit(EVENT_UPDATE_MAIN_PLAYER, this.mainPlayer);

            for (const p of e.payload.room.players) {
              this.emit(EVENT_ADD_PLAYER, new Player(false, p));
            }
          }

          if (msg.channel === CHAN_ROOM) {
            this.handleRoomEventMessage(msg);
          } else if (msg.channel !== CHAN_NONE) {
            this.handleGameUpdateEventMessage(msg);
          }
        } catch (e) {
          console.error('unable to process message data', event, e);
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

  private handleRoomEventMessage(msg: ServerEvent<unknown>): void {
    switch (msg.type) {
      case SERVER_EVENT_PLAYER_JOIN:
        {
          const e = msg as ServerEvent<PlayerJoinPayload>;

          if (this.mainPlayer?.id !== e.payload.id) {
            this.emit(EVENT_ADD_PLAYER, new Player(false, e.payload));
          }
        }
        break;
      case SERVER_EVENT_PLAYER_LEAVE:
        {
          const e = msg as ServerEvent<PlayerLeavePayload>;

          this.emit(EVENT_REMOVE_PLAYER, e.payload.id);
        }
        break;
      case SERVER_EVENT_GAME_START:
        {
          // todo: this is bad
          this.emit(SERVER_EVENT_GAME_START);
        }
        break;
      case SERVER_EVENT_UPDATE_BEDROCK_TARGETS:
        {
          const e = msg as ServerEvent<BedrockTargetsUpdatePayload>;

          this.emit(SERVER_EVENT_UPDATE_BEDROCK_TARGETS, e.payload.targets);
        }
        break;
      default:
        break;
    }
  }

  private handleGameUpdateEventMessage(msg: ServerEvent<unknown>): void {
    const playerId = msg.channel.split('/')[1];

    this.emit(specificEvent(msg.type, playerId), {
      playerId,
      payload: msg.payload,
    });
  }

  public destroy() {
    // todo: remove event listeners?

    this.socketConn?.close();
    this.socketConn = null;
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
