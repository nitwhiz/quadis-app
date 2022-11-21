<script setup lang="ts">
import { onMounted } from 'vue';
import GameHost from '../quadis/game/GameHost';

onMounted(() => {
  GameHost.getInstance().injectApp();
});
</script>

<template>
  <div class="main">
    <router-view />
  </div>
</template>
