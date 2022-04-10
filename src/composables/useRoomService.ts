import RoomService from '../bloccs/room/RoomService';
import { ref } from 'vue';

const roomService = ref(null as RoomService | null);

const createRoomService = (roomId: string): RoomService => {
  const service = new RoomService(roomId);

  roomService.value = service;

  return service;
};

const useRoomService = () => {
  return {
    createRoomService,
    roomService,
  };
};

export default useRoomService;
