import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Game from './Game';

// todo: refactor

export interface Player {
  id: string;
  name: string;
  create_at: number;
}

interface Room {
  id: string;
  players: Player[];
}

export interface HelloAck {
  room: Room;
  you: Player;
}

export type PlayerJoin = Player;

export type PlayerLeave = Player;

export interface FieldUpdate {
  data: number[];
  width: number;
  height: number;
}

export interface FallingPieceUpdate {
  piece_name: number;
  rotation: number;
  x: number;
  y: number;
}

export interface NextPieceUpdate {
  piece_name: number;
}

export interface HoldPieceUpdate {
  piece_name: number;
}

export interface ScoreUpdate {
  score: number;
  lines: number;
}

export const CHAN_ROOM = 'room';

const SERVER_EVENT_HELLO = 'hello';
const SERVER_EVENT_HELLO_ACK = 'hello_ack';

const SERVER_EVENT_GAME_START = 'game_start';
const SERVER_EVENT_GAME_OVER = 'game_over';

const SERVER_EVENT_UPDATE_SCORE = 'update_score';
const SERVER_EVENT_UPDATE_FIELD = 'update_field';
const SERVER_EVENT_UPDATE_FALLING_PIECE = 'update_falling_piece';
const SERVER_EVENT_UPDATE_NEXT_PIECE = 'update_next_piece';
const SERVER_EVENT_UPDATE_HOLD_PIECE = 'update_hold_piece';

const SERVER_EVENT_PLAYER_JOIN = 'player_join';
const SERVER_EVENT_PLAYER_LEAVE = 'player_leave';

type ServerEventType =
  | typeof SERVER_EVENT_HELLO
  | typeof SERVER_EVENT_HELLO_ACK
  | typeof SERVER_EVENT_GAME_START
  | typeof SERVER_EVENT_GAME_OVER
  | typeof SERVER_EVENT_UPDATE_SCORE
  | typeof SERVER_EVENT_UPDATE_FIELD
  | typeof SERVER_EVENT_UPDATE_FALLING_PIECE
  | typeof SERVER_EVENT_UPDATE_NEXT_PIECE
  | typeof SERVER_EVENT_UPDATE_HOLD_PIECE
  | typeof SERVER_EVENT_PLAYER_JOIN
  | typeof SERVER_EVENT_PLAYER_LEAVE;

export const CLIENT_EVENT_SUCCESSFUL_HELLO = 'hello_success';
export const CLIENT_EVENT_UPDATE_PLAYERS = 'players_update';
export const CLIENT_EVENT_GAME_OVER = 'game_over';
export const CLIENT_EVENT_ROOM_HAS_GAMES_RUNNING = 'room_has_games_running';

type ClientEventType =
  | typeof CLIENT_EVENT_UPDATE_PLAYERS
  | typeof CLIENT_EVENT_GAME_OVER
  | typeof CLIENT_EVENT_ROOM_HAS_GAMES_RUNNING
  | typeof CLIENT_EVENT_SUCCESSFUL_HELLO;

export interface EventMessage<T> {
  channel: string;
  original_channel: string;
  type: ServerEventType;
  payload: T;
}

export default class RoomService extends EventEmitter<ClientEventType> {
  private readonly roomId: string;

  private readonly playerName: string;

  private playerId: string;

  private socketConn: WebSocket | null;

  private readonly players: Record<string, Player>;

  private readonly games: Record<string, Game>;

  constructor(playerName: string, roomId: string) {
    super();

    this.playerName = playerName;
    this.roomId = roomId;

    this.playerId = '';

    this.socketConn = null;

    this.players = {};
    this.games = {};
  }

  public registerGame(playerId: string, game: Game) {
    this.games[playerId] = game;
  }

  public destroyGame(playerId: string) {
    this.games[playerId]?.destroy();
    delete this.games[playerId];
  }

  public getPlayers(): Player[] {
    if (!this.playerId) {
      return [];
    }

    return [
      this.players[this.playerId],
      ...Object.values(this.players)
        .filter((p) => p.id !== this.playerId)
        .sort((pA, pB) => pA.create_at - pB.create_at),
    ];
  }

  public connect(): void {
    this.socketConn = new WebSocket(
      `ws://${import.meta.env.VITE_GAME_SERVER}/rooms/${this.roomId}/socket`,
    );

    this.socketConn.addEventListener('close', (e) => {
      console.log('socket closed');

      if (e.reason === 'room_has_games_running') {
        this.emit(CLIENT_EVENT_ROOM_HAS_GAMES_RUNNING);
      }

      // todo: remove event listeners on body
    });

    this.socketConn.addEventListener('open', () => {
      console.log('socket open');

      const helloListener = (event: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(event.data) as EventMessage<unknown>;

          if (msg.type === SERVER_EVENT_HELLO) {
            this.socketConn?.send(
              JSON.stringify({
                name: this.playerName.toUpperCase(),
              }),
            );

            this.emit(CLIENT_EVENT_SUCCESSFUL_HELLO);

            this.socketConn?.removeEventListener('message', helloListener);
          }
        } catch (e) {
          console.error('unable to process hello', event, e);
        }
      };

      this.socketConn?.addEventListener('message', helloListener);

      document.addEventListener('keydown', (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowLeft':
            this.socketConn?.send('L');
            break;
          case 'ArrowRight':
            this.socketConn?.send('R');
            break;
          case 'ArrowUp':
            this.socketConn?.send('X');
            break;
          case 'ArrowDown':
            this.socketConn?.send('D');
            break;
          case 'Shift':
            this.socketConn?.send('H');
            break;
          case ' ':
            this.socketConn?.send('P');
            break;
          default:
            break;
        }
      });
    });

    this.socketConn.addEventListener(
      'message',
      (event: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(event.data) as EventMessage<unknown>;

          if (msg.type === SERVER_EVENT_HELLO_ACK) {
            const e = msg as EventMessage<HelloAck>;

            this.playerId = e.payload.you.id;

            for (const p of e.payload.room.players) {
              this.players[p.id] = p;
            }

            this.emit(CLIENT_EVENT_UPDATE_PLAYERS, this.getPlayers());
          }

          if (msg.channel === CHAN_ROOM) {
            this.handleRoomEventMessage(msg);
          } else {
            this.handleGameUpdateEventMessage(msg);
          }
        } catch (e) {
          console.error('unable to process message data', event, e);
        }
      },
    );
  }

  private handleRoomEventMessage(msg: EventMessage<unknown>): void {
    switch (msg.type) {
      case SERVER_EVENT_PLAYER_JOIN:
        {
          const e = msg as EventMessage<PlayerJoin>;

          this.players[e.payload.id] = e.payload;

          this.emit(CLIENT_EVENT_UPDATE_PLAYERS, this.getPlayers());
        }
        break;
      case SERVER_EVENT_PLAYER_LEAVE:
        {
          const e = msg as EventMessage<PlayerLeave>;

          delete this.players[e.payload.id];

          this.games[e.payload.id]?.destroy();
          delete this.games[e.payload.id];

          this.emit(CLIENT_EVENT_UPDATE_PLAYERS, this.getPlayers());
        }
        break;
      case SERVER_EVENT_GAME_START:
        Object.values(this.games).forEach((g) => g.start());
        break;
      default:
        break;
    }
  }

  private handleGameUpdateEventMessage(msg: EventMessage<unknown>): void {
    switch (msg.type) {
      case SERVER_EVENT_UPDATE_FALLING_PIECE:
        {
          const e = msg as EventMessage<FallingPieceUpdate>;
          const playerId = e.channel.split('/')[1];

          this.games[playerId]?.setFallingPiece(
            e.payload.piece_name,
            e.payload.rotation,
            e.payload.x,
            e.payload.y,
          );
        }
        break;
      case SERVER_EVENT_UPDATE_NEXT_PIECE:
        {
          const e = msg as EventMessage<NextPieceUpdate>;
          const playerId = e.channel.split('/')[1];

          this.games[playerId]?.setNextPiece(e.payload.piece_name);
        }
        break;
      case SERVER_EVENT_UPDATE_HOLD_PIECE:
        {
          const e = msg as EventMessage<HoldPieceUpdate>;
          const playerId = e.channel.split('/')[1];

          this.games[playerId]?.setHoldPiece(e.payload.piece_name);
        }
        break;
      case SERVER_EVENT_UPDATE_FIELD:
        {
          const e = msg as EventMessage<FieldUpdate>;
          const playerId = e.channel.split('/')[1];

          this.games[playerId]?.setField(
            e.payload.width,
            e.payload.height,
            e.payload.data,
          );
        }
        break;
      case SERVER_EVENT_UPDATE_SCORE:
        {
          const e = msg as EventMessage<ScoreUpdate>;
          const playerId = e.channel.split('/')[1];

          // todo: do not use game as event bus

          this.games[playerId]?.setScore(e.payload.score, e.payload.lines);
        }
        break;
      case SERVER_EVENT_GAME_OVER:
        {
          // todo: add type
          const e = msg as EventMessage<unknown>;
          const playerId = e.channel.split('/')[1];

          // todo: don't pass string
          // todo: unused
          this.emit(CLIENT_EVENT_GAME_OVER, playerId);
        }
        break;
      default:
        break;
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
