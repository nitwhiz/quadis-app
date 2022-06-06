<template>
  <div class="main">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito&family=Press+Start+2P&display=swap');

@font-face {
  font-family: 'Press Start 2P';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/font/press_start_2p.ttf) format('truetype');
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;

  width: 100%;
  height: 100%;

  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  font-family: 'Press Start 2P', monospace;
  color: #f1f1f1;

  background-color: #111111;

  .main {
    display: flex;
    justify-content: center;
    align-items: center;

    height: 100%;
    width: 100%;
  }
}
</style>
