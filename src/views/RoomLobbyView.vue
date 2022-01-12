<template>
  <h1>Players</h1>
  <div class="players-wrapper">
    <div v-for="p in players" :key="p.id" class="player">{{ p.name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useRoomService from '../composables/useRoomService';

export default defineComponent({
  setup() {
    const { players } = useRoomService();

    return {
      players,
    };
  },
});
</script>

<style scoped></style>
