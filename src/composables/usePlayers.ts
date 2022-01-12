import RoomService, {
  HelloAck,
  Player,
  PlayerJoinData,
  PlayerLeaveData,
} from '../bloccs/RoomService';
import { ref } from 'vue';

const usePlayers = (roomService: RoomService) => {
  const players = ref({} as Record<string, Player>);

  roomService.on('room_player_join', (payload: PlayerJoinData) => {
    players.value[payload.player.id] = payload.player;
  });

  roomService.on('room_player_leave', (payload: PlayerLeaveData) => {
    delete players.value[payload.player.id];
  });

  roomService.on('hello_ack', (payload: HelloAck) => {
    players.value = payload.room.players;
  });

  return {
    players,
  };
};

export default usePlayers;
