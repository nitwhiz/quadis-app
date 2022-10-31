import axios from 'axios';

let gameServer = '';
let tls = false;

// todo: this should be part of the global RoomService instance -> useRoomService composable?
const envRequest = axios
  .get<{
    gameServer: string;
    tls: boolean;
  }>('/env.json')
  .then((response) => {
    gameServer = response.data.gameServer;
    tls = response.data.tls;
  });

export const useEnvironment = () => {
  return envRequest.then(() => {
    return {
      gameServer,
      tls,
    };
  });
};
