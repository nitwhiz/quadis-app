<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameHost } from '../composables/useGameHost';

const gameHost = useGameHost();

onMounted(() => {
  gameHost.injectApp();
});
</script>

<template>
  <div class="main">
    <router-view />
  </div>
</template>
