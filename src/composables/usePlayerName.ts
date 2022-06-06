import { computed, ref, watch } from 'vue';

const LOCAL_STORAGE_KEY = 'bloccsPlayerName';

const confirmed = ref(false);
const playerName = ref('');

const nameByLocalStorage = localStorage.getItem(LOCAL_STORAGE_KEY);

if (nameByLocalStorage !== null) {
  playerName.value = nameByLocalStorage;
}

const confirm = () => {
  if (playerName.value.trim()) {
    confirmed.value = true;

    // sanitize name
    playerName.value = playerName.value.trim().substring(0, 8).toUpperCase();

    localStorage.setItem(LOCAL_STORAGE_KEY, playerName.value);
  }
};

watch(playerName, () => {
  playerName.value = playerName.value.trim();
});

const isConfirmed = computed(() => confirmed.value);

const usePlayerName = () => {
  return {
    confirm,
    isConfirmed,
    playerName,
  };
};

export default usePlayerName;
