<script setup lang="ts">
import GameHost from '../quadis/game/GameHost';
import { onMounted, ref } from 'vue';
import { useEnvironment } from '../composables/useEnvironment';
import RoomService from '../quadis/room/RoomService';

const gameHost = GameHost.getInstance();
const ready = ref(false);

const environment = await useEnvironment();

gameHost.injectApp();

onMounted(() => {
  RoomService.gameServer = environment.gameServer.value;
  RoomService.tls = environment.tls.value;

  ready.value = true;
});
</script>

<template>
  <div v-if="ready" class="main">
    <router-view />
  </div>
</template>
