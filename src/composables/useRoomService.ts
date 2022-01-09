import RoomService, { Player, RoomData } from '../game/RoomService';
import { ref } from 'vue';

let service = null as RoomService | null;

const players = ref({} as Record<string, Player>);

const controllingPlayerId = ref('');

const destroyService = () => {
  console.log('destroying room service');

  service?.destroy();

  service = null;
};

const useRoomService = (playerName: string, roomId?: string) => {
  if (roomId) {
    if (service === null) {
      service = new RoomService(playerName, roomId);
    }

    service.connect();

    service.on('room_info', (payload: RoomData) => {
      players.value = service?.getPlayers() || {};
      controllingPlayerId.value = payload.you.id;
    });

    service.on('room_player_join', () => {
      players.value = service?.getPlayers() || {};
    });

    service.on('room_player_leave', () => {
      players.value = service?.getPlayers() || {};
    });
  }

  return {
    service,
    destroyService,
    players,
    controllingPlayerId,
  };
};

export default useRoomService;
