<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Console from '../console/Console';

const console = new Console();

const logs = ref([] as string[]);
const input = ref(null as null | HTMLInputElement);

onMounted(() => {
  console.on('log', (log: string) => {
    logs.value.push(log);

    if (logs.value.length >= 6) {
      logs.value.shift();
    }
  });

  if (input.value) {
    input.value.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        return;
      }

      e.stopPropagation();

      if (e.key === 'Enter') {
        const cmdline = (e.target as HTMLInputElement).value;

        (e.target as HTMLInputElement).value = '';

        console.run(cmdline);
      }
    });
  }
});
</script>

<template>
  <div class="console-host">
    <div class="logs">
      <div v-for="(log, i) of logs" :key="i" class="entry">{{ log }}</div>
    </div>
    <div class="input-wrapper">
      <input ref="input" placeholder=">" type="text" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.console-host {
  font-family: monospace;
  font-size: 12px;

  position: absolute;

  top: 0;
  left: 0;

  width: 100%;

  max-height: 256px;
  padding: 12px;

  background-color: #272727;

  .logs {
    .entry {
      user-select: text;

      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .input-wrapper {
    input {
      font-family: monospace;
      text-transform: unset;

      font-size: 12px;
      padding: 8px 4px;

      width: 100%;
    }
  }
}
</style>
