<template>
  <ConsoleHost v-if="isDev && consoleVisible" />
  <Suspense>
    <MainView />
    <template #fallback>Loading ...</template>
  </Suspense>
  <div class="version">
    {{ version }}
  </div>
</template>

<script setup lang="ts">
import MainView from './views/MainView.vue';
import ConsoleHost from './components/DevConsoleHost.vue';
import { onMounted, onUnmounted, ref } from 'vue';

const isDev = import.meta.env.MODE === 'development';

const consoleVisible = ref(false);

if (isDev) {
  const handleConsoleOpenHandler = (event: KeyboardEvent) => {
    if (event.key === 'C' && event.ctrlKey && event.shiftKey) {
      consoleVisible.value = true;

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'Escape') {
      consoleVisible.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleConsoleOpenHandler);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleConsoleOpenHandler);
  });
}

const version = __BUILD_VERSION__;
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito&family=Press+Start+2P&display=swap');

* {
  box-sizing: border-box;
  user-select: none;
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
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  font-family: 'Press Start 2P', monospace;
  color: #f1f1f1;

  background-color: #111111;

  z-index: 10;

  .main {
    height: 100%;
    width: 100%;
  }

  .version {
    position: absolute;

    bottom: 8px;
    right: 8px;

    color: #333;
    font-size: 8px;

    z-index: 1000;
  }
}

body > canvas {
  position: absolute;

  top: 0;
  left: 0;

  z-index: 20;

  pointer-events: none;
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
