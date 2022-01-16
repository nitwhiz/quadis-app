import EventEmitter from 'eventemitter3';
import axios from 'axios';
import Game, { PieceType } from './Game';

export interface Player {
  id: string;
  name: string;
  create_at: number;
}

interface Room {
  id: string;
  players: Record<string, Player>;
}

export interface HelloAck {
  room: Room;
  you: Player;
}

export interface PlayerJoinData {
  player: Player;
}

export interface PlayerLeaveData {
  player: Player;
}

export interface Field {
  data: number[];
  width: number;
  height: number;
}

export interface GameUpdateData {
  id: string;
  field: Field;
}

interface Piece {
  name: string;
  rotation: number;
}

export interface FallingPiece {
  next_piece: Piece;
  current_piece: Piece;
  x: number;
  y: number;
  speed: number;
  fall_timer: number;
}

export interface FallingPieceUpdateData {
  falling_piece_data: FallingPiece;
  piece_display: number[];
}

export const CHAN_ROOM = 'room';

const SERVER_EVENT_HELLO = 'hello';
const SERVER_EVENT_HELLO_ACK = 'hello_ack';
const SERVER_EVENT_ROWS_CLEARED = 'rows_cleared';
const SERVER_EVENT_GAME_UPDATE = 'game_update';
const SERVER_EVENT_PLAYER_JOIN = 'player_join';
const SERVER_EVENT_PLAYER_LEAVE = 'player_leave';
const SERVER_EVENT_GAME_OVER = 'game_over';
const SERVER_EVENT_GAME_START = 'game_start';
const SERVER_EVENT_UPDATE_FALLING_PIECE = 'update_falling_piece';

type ServerEventType =
  | typeof SERVER_EVENT_HELLO
  | typeof SERVER_EVENT_HELLO_ACK
  | typeof SERVER_EVENT_ROWS_CLEARED
  | typeof SERVER_EVENT_GAME_UPDATE
  | typeof SERVER_EVENT_PLAYER_JOIN
  | typeof SERVER_EVENT_PLAYER_LEAVE
  | typeof SERVER_EVENT_GAME_OVER
  | typeof SERVER_EVENT_GAME_START
  | typeof SERVER_EVENT_UPDATE_FALLING_PIECE;

export const CLIENT_EVENT_UPDATE_PLAYERS = 'players_update';

type ClientEventType = typeof CLIENT_EVENT_UPDATE_PLAYERS;

export interface EventMessage<T> {
  channel: string;
  type: ServerEventType;
  payload: T;
}

export default class RoomService extends EventEmitter<ClientEventType> {
  private readonly roomId: string;

  private readonly playerName: string;

  private playerId: string;

  private socketConn: WebSocket | null;

  private players: Record<string, Player>;

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

  public removeGame(playerId: string) {
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

    this.socketConn.addEventListener('close', () => {
      console.log('socket closed');
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
          case ' ':
            this.socketConn?.send('P');
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
            this.players = e.payload.room.players;

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
          const e = msg as EventMessage<PlayerJoinData>;

          this.players[e.payload.player.id] = e.payload.player;

          this.emit(CLIENT_EVENT_UPDATE_PLAYERS, this.getPlayers());
        }
        break;
      case SERVER_EVENT_PLAYER_LEAVE:
        {
          const e = msg as EventMessage<PlayerLeaveData>;

          delete this.players[e.payload.player.id];

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
          const e = msg as EventMessage<FallingPieceUpdateData>;
          const playerId = e.channel.split('/')[1];

          this.games[playerId]?.setFallingPieceData(
            e.payload.falling_piece_data.current_piece.name as PieceType,
            e.payload.falling_piece_data.current_piece.rotation,
            e.payload.falling_piece_data.x,
            e.payload.falling_piece_data.y,
            e.payload.piece_display,
          );
        }
        break;
      case SERVER_EVENT_GAME_UPDATE:
        {
          const e = msg as EventMessage<GameUpdateData>;
          const playerId = e.channel.split('/')[1];

          this.games[playerId]?.setFieldData(
            e.payload.field.width,
            e.payload.field.height,
            e.payload.field.data,
          );
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
