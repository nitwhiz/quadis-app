import { ref } from 'vue';
import axios from 'axios';

const gameServer = ref('');
const tls = ref(false);

const envRequest = axios
  .get<{
    gameServer: string;
    tls: boolean;
  }>('/env.json')
  .then((response) => {
    gameServer.value = response.data.gameServer;
    tls.value = response.data.tls;
  });

export const useEnvironment = () => {
  return envRequest.then(() => {
    return {
      gameServer,
      tls,
    };
  });
};
