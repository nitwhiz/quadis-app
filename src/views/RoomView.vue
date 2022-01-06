<template>
  <div class="controls">
    <button @click="service?.startGame()">start</button>
  </div>
  <div v-for="p in players" :key="p.id" class="game-wrapper">
    <div>{{ p.id }}</div>
    <div>{{ p.name }}</div>
    <BloccsGameDisplay :player-id="p.id" />
  </div>
</template>

<script lang="ts">
import BloccsGameDisplay from '../components/BloccsGameDisplay.vue';

import { defineComponent } from 'vue';
import useRoomService from '../composables/useRoomService';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    BloccsGameDisplay,
  },
  setup() {
    const { params } = useRoute();
    const { service, destroyService, players } = useRoomService(
      params.roomId as string,
    );

    return {
      service,
      destroyService,
      players,
    };
  },
  unmounted() {
    this.destroyService();
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
