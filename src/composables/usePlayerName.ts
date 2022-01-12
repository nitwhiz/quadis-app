import { ref, watchEffect } from 'vue';

const playerName = ref('');
const isConfirmed = ref(false);

const lsName = localStorage.getItem('player-name');

if (lsName) {
  playerName.value = lsName;
}

watchEffect(() => {
  localStorage.setItem('player-name', playerName.value);
});

const usePlayerName = () => {
  return {
    playerName,
    isConfirmed,
  };
};

export default usePlayerName;
