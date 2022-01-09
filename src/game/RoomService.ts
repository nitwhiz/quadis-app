import EventEmitter from 'eventemitter3';
import axios from 'axios';

export interface Player {
  id: string;
  name: string;
  create_at: number;
}

interface Room {
  id: string;
  players: Record<string, Player>;
}

export interface RoomData {
  room: Room;
  you: Player;
}

interface PlayerJoinData {
  player: Player;
}

interface PlayerLeaveData {
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

type EventType =
  | 'room_player_game_rows_cleared'
  | 'room_player_game_update'
  | 'room_player_join'
  | 'room_player_leave'
  | 'room_info'
  | 'room_player_game_over'
  | 'room_player_update_falling_piece';

interface EventBody<T> {
  channel: string;
  type: EventType;
  payload: T;
}

export default class RoomService extends EventEmitter<EventType> {
  private readonly roomId: string;

  private readonly playerName: string;

  private players: Record<string, Player>;

  private socketConn: WebSocket | null;

  constructor(playerName: string, roomId: string) {
    super();

    this.playerName = playerName;
    this.roomId = roomId;
    this.players = {};

    this.socketConn = null;
  }

  public getPlayers(): Record<string, Player> {
    return { ...this.players };
  }

  public connect(): void {
    this.socketConn = new WebSocket(
      `ws://localhost:7000/rooms/${this.roomId}/socket`,
    );

    this.socketConn.addEventListener('close', () => {
      console.log('socket closed');

      // todo: remove event listeners on body
    });

    this.socketConn.addEventListener('open', () => {
      console.log('socket open');

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
          const msg = JSON.parse(event.data) as EventBody<unknown>;

          this.processSocketMessage(msg);
        } catch (e) {
          console.error('unable to process message data', event, e);
        }
      },
    );
  }

  public destroy() {
    this.socketConn?.close();
    this.socketConn = null;
  }

  private processSocketMessage(msg: EventBody<unknown>): void {
    switch (msg.type) {
      case 'room_info': {
        const roomInfoMessage = msg as EventBody<RoomData>;

        this.players = {
          ...roomInfoMessage.payload.room.players,
        };

        break;
      }
      case 'room_player_join': {
        const playerJoinMessage = msg as EventBody<PlayerJoinData>;

        this.players[playerJoinMessage.payload.player.id] =
          playerJoinMessage.payload.player;

        break;
      }
      case 'room_player_leave': {
        const playerLeaveMessage = msg as EventBody<PlayerLeaveData>;

        delete this.players[playerLeaveMessage.payload.player.id];

        break;
      }
      case 'room_player_game_update':
        // ignored
        break;
      default:
        console.warn('unknown message', msg);
        break;
    }

    this.emit(msg.type, msg.payload);
  }

  public startGame(): Promise<boolean> {
    return axios
      .post(`http://localhost:7000/rooms/${this.roomId}/start`)
      .then(() => true)
      .catch((reason) => {
        console.log('start request failed:', reason);

        return false;
      });
  }
}
