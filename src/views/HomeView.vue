<template>
  <PlayerName :is-join="false" @confirm="createRoom" />
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import PlayerName from '../components/PlayerName.vue';
import usePlayerName from '../composables/usePlayerName';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    PlayerName,
  },
  setup() {
    const { confirm } = usePlayerName();
    const { push } = useRouter();
  },
});
</script>

<style scoped lang="scss"></style>
