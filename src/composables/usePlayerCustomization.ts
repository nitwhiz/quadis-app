import { ref, watchEffect } from 'vue';

const playerName = ref('');
const isConfirmed = ref(false);

const lsName = localStorage.getItem('player-name');

if (lsName) {
  playerName.value = lsName;
}

watchEffect(() => {
  localStorage.setItem('playerName', playerName.value);
});

const usePlayerCustomization = () => {
  return {
    playerName,
    isConfirmed,
  };
};

export default usePlayerCustomization;
