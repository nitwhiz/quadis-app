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

type EventType =
  | 'hello'
  | 'hello_ack'
  | 'room_player_game_rows_cleared'
  | 'room_player_game_update'
  | 'room_player_join'
  | 'room_player_leave'
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

  private socketConn: WebSocket | null;

  private sentHelloResponse: boolean;

  private started: boolean;

  constructor(playerName: string, roomId: string) {
    super();

    this.playerName = playerName;
    this.roomId = roomId;

    this.socketConn = null;

    this.sentHelloResponse = false;
    this.started = false;
  }

  public isStarted(): boolean {
    return this.started;
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

      this.socketConn?.addEventListener(
        'message',
        (event: MessageEvent<string>) => {
          if (this.sentHelloResponse) {
            // todo: remove hello listener
            return;
          }

          try {
            const msg = JSON.parse(event.data) as EventBody<unknown>;

            if (msg.type === 'hello') {
              this.socketConn?.send(
                JSON.stringify({
                  name: this.playerName,
                }),
              );

              this.sentHelloResponse = true;
            }
          } catch (e) {
            console.error('unable to process hello', event, e);
          }
        },
      );

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

          this.emit(msg.type, msg.payload);
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

  public startGame(): Promise<boolean> {
    return axios
      .post(`http://localhost:7000/rooms/${this.roomId}/start`)
      .then(() => {
        this.started = true;

        return true;
      })
      .catch((reason) => {
        console.log('start request failed:', reason);

        return false;
      });
  }
}
