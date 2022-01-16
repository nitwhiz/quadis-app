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
    height: 100%;
    width: 100%;
  }
}

input {
  padding: 8px 12px;

  border: 0;
  background: 0;
  outline: 0;

  border-bottom: 2px solid #aaa;

  font-family: 'Press Start 2P', monospace;
  color: #aaa;

  text-transform: uppercase;

  transition-property: color, border-color;
  transition-duration: 200ms;

  &:focus {
    border-color: #f1f1f1;
    color: #f1f1f1;
  }
}

button {
  cursor: pointer;
  padding: 12px 16px;

  border: 2px solid #aaa;
  background: 0;
  outline: 0;

  font-family: 'Press Start 2P', monospace;
  color: #aaa;

  text-transform: uppercase;

  transition-property: color, border-color;
  transition-duration: 200ms;

  &:hover {
    border-color: #f1f1f1;
    color: #f1f1f1;
  }
}
</style>
