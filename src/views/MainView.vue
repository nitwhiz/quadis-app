<script setup lang="ts">
import GameHost from '../quadis/game/GameHost';
import { onMounted } from 'vue';
import { useEnvironment } from '../composables/useEnvironment';
import RoomService from '../quadis/room/RoomService';

const gameHost = GameHost.getInstance();
const environment = await useEnvironment();

RoomService.gameServer = environment.gameServer;
RoomService.tls = environment.tls;

onMounted(() => {
  gameHost.injectApp();
});
</script>

<template>
  <div class="main">
    <router-view />
  </div>
</template>
