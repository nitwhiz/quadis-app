import axios from 'axios';
import RoomService from '../quadis/room/RoomService';

let gameServer = '';
let tls = false;
let roomService: RoomService | null = null;

const envRequest = axios
  .get<{
    gameServer: string;
    tls: boolean;
  }>('/env.json')
  .then((response) => {
    gameServer = response.data.gameServer;
    tls = response.data.tls;

    console.log(
      `creating RoomService for ${gameServer} (tls: ${tls ? 'yes' : 'no'})`,
    );

    roomService = new RoomService(gameServer, tls);
  });

export const useRoomService = () => {
  return envRequest.then(() => {
    if (roomService) {
      return roomService;
    } else {
      throw new Error('no RoomService found');
    }
  });
};
