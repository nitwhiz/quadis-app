import RoomService, {
  Field,
  GameUpdateData,
  Player,
} from '../game/RoomService';
import { ref } from 'vue';

let service = null as RoomService | null;

const players = ref([] as Player[]);

const destroyService = () => {
  console.log('destroying room service');

  service?.destroy();

  service = null;
};

const useRoomService = (roomId?: string) => {
  if (roomId) {
    if (service === null) {
      service = new RoomService(roomId);
    }

    service.connect();

    service.on('room_info', () => {
      players.value = service?.getPlayers() || [];
    });

    service.on('room_player_join', () => {
      players.value = service?.getPlayers() || [];
    });

    service.on('room_player_leave', () => {
      players.value = service?.getPlayers() || [];
    });
  }

  return {
    service,
    destroyService,
    players,
  };
};

export default useRoomService;
