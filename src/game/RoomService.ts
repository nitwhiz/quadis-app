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

interface RoomData {
  room: Room;
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
  player: Player;
  field: Field;
}

type EventType =
  | 'room_player_game_rows_cleared'
  | 'room_player_game_update'
  | 'room_player_join'
  | 'room_player_leave'
  | 'room_info'
  | 'room_player_game_over';

interface EventBody<T> {
  type: EventType;
  data: T;
}

export default class RoomService extends EventEmitter<EventType> {
  private readonly roomId: string;

  private players: Record<string, Player>;

  private socketConn: WebSocket | null;

  constructor(roomId: string) {
    super();

    this.roomId = roomId;
    this.players = {};

    this.socketConn = null;
  }

  public getPlayers(): Player[] {
    return [...Object.values(this.players)].sort(
      (p1, p2) => p1.create_at - p2.create_at,
    );
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
          case ' ':
            this.socketConn?.send('D');
            break;
        }
      });
    });

    this.socketConn.addEventListener(
      'message',
      (event: MessageEvent<string>) => {
        console.log(event.data.length);

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
          ...roomInfoMessage.data.room.players,
        };

        break;
      }
      case 'room_player_join': {
        const playerJoinMessage = msg as EventBody<PlayerJoinData>;

        this.players[playerJoinMessage.data.player.id] =
          playerJoinMessage.data.player;

        break;
      }
      case 'room_player_leave': {
        const playerLeaveMessage = msg as EventBody<PlayerLeaveData>;

        delete this.players[playerLeaveMessage.data.player.id];

        break;
      }
      case 'room_player_game_update':
        // ignored
        break;
      default:
        console.warn('unknown message', msg);
        break;
    }

    this.emit(msg.type, msg.data);
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
