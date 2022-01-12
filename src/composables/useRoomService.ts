import RoomService, {
  HelloAck,
  Player,
  PlayerJoinData,
  PlayerLeaveData,
} from '../bloccs/RoomService';
import usePlayerName from './usePlayerName';
import { ref, watch } from 'vue';

let roomService: RoomService | null = null;

const playerData = ref({} as Record<string, Player>);
const players = ref([] as Player[]);

const ensureRoomService = (roomId: string) => {
  const { playerName, isConfirmed } = usePlayerName();

  if (isConfirmed) {
    if (roomService === null) {
      roomService = new RoomService(playerName.value, roomId);

      watch(playerData, () => {
        players.value = Object.values(playerData.value).sort((pA, pB) => {
          return pA.create_at - pB.create_at;
        });
      });

      roomService.on('room_player_join', (payload: PlayerJoinData) => {
        playerData.value[payload.player.id] = payload.player;
      });

      roomService.on('room_player_leave', (payload: PlayerLeaveData) => {
        delete playerData.value[payload.player.id];
      });

      roomService.on('hello_ack', (payload: HelloAck) => {
        playerData.value = payload.room.players;
      });

      roomService.connect();
    }

    return true;
  }

  return false;
};

const useRoomService = () => {
  return {
    ensureRoomService,
    roomService,
    players,
  };
};

export default useRoomService;
