import { ref } from 'vue';

const playerName = ref('');

const updatePlayerName = (name: string) => {
  playerName.value = name;
};

const usePlayerName = () => {
  return {
    playerName,
    updatePlayerName,
  };
};

export default usePlayerName;
