import EventEmitter from 'eventemitter3';
import axios from 'axios';
import {
  ClientEventType,
  EVENT_GAME_OVER,
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_SUCCESSFUL_HELLO,
  EVENT_UPDATE_PLAYERS,
  SERVER_EVENT_GAME_OVER,
  SERVER_EVENT_GAME_START,
  SERVER_EVENT_HELLO,
  SERVER_EVENT_HELLO_ACK,
  SERVER_EVENT_PLAYER_JOIN,
  SERVER_EVENT_PLAYER_LEAVE,
} from '../event/EventType';
import Player from '../player/Player';
import {
  HelloAckPayload,
  PlayerGameOverPayload,
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

export default class RoomService extends EventEmitter<ClientEventType> {
  private readonly roomId: string;

  private socketConn: WebSocket | null;

  private readonly players: Record<string, Player>;

  private readonly inputHandler: InputHandler;

  constructor(roomId: string) {
    super();

    this.roomId = roomId;

    this.socketConn = null;

    this.players = {};

    this.inputHandler = new InputHandler([
      new KeyboardInputAdapter(),
      new GamepadInputAdapter(),
    ]);
  }

  public getMainPlayer(): Player | null {
    return Object.values(this.players).find((p) => p.isMain) || null;
  }

  public getOtherPlayers(): Player[] {
    return Object.values(this.players)
      .filter((p) => !p.isMain)
      .sort((pA, pB) => pA.createAt - pB.createAt);
  }

  public getPlayerById(playerId: string): Player | null {
    return this.players[playerId] || null;
  }

  public addPlayer(player: Player): void {
    const mainPlayer = this.getMainPlayer();

    if (mainPlayer && mainPlayer.id === player.id) {
      // prevent 2 main players
      return;
    }

    this.players[player.id] = player;

    this.emit(EVENT_UPDATE_PLAYERS);
  }

  public removePlayer(playerId: string | null) {
    if (!playerId) {
      return;
    }

    this.players[playerId]?.destroy();
    delete this.players[playerId];

    this.emit(EVENT_UPDATE_PLAYERS);
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

  private sendMainPlayerCommand(cmd: Command): void {
    this.socketConn?.send(cmd);
  }

  public addOpenHandler(playerName: string): void {
    this.socketConn?.addEventListener('open', () => {
      console.log('socket open');

      this.addHelloListener(playerName);
      this.inputHandler.on(EVENT_INPUT_COMMAND, (cmd: Command) => {
        this.sendMainPlayerCommand(cmd);
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

            this.addPlayer(new Player(true, e.payload.you));

            for (const p of e.payload.room.players) {
              if (p.id !== e.payload.you.id) {
                this.addPlayer(new Player(false, p));
              }
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

          this.addPlayer(new Player(false, e.payload));
        }
        break;
      case SERVER_EVENT_PLAYER_LEAVE:
        {
          const e = msg as ServerEvent<PlayerLeavePayload>;

          // todo: leaving mid-update spawns pixi errors

          this.removePlayer(e.payload.id);
        }
        break;
      case SERVER_EVENT_GAME_START:
        Object.values(this.players).forEach((p) => p.startGame());
        break;
      case SERVER_EVENT_GAME_OVER:
        {
          const e = msg as ServerEvent<PlayerGameOverPayload>;

          this.emit(EVENT_GAME_OVER, e.payload);
        }
        break;
      default:
        break;
    }
  }

  private handleGameUpdateEventMessage(msg: ServerEvent<unknown>): void {
    const playerId = msg.channel.split('/')[1];

    if (!playerId) {
      console.warn('dropping event, no playerId');
      return;
    }

    const player = this.players[playerId];

    if (!player) {
      console.warn('dropping event, player not found');
      return;
    }

    const passEvent = player.dispatchServerEvent(msg);

    if (passEvent !== null) {
      this.emit(passEvent.type, passEvent.payload);
    }
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
