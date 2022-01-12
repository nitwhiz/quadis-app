<template>
  <div class="games">
    <div v-for="p in players" :key="p.id" class="game-wrapper">
      game display
      <!-- render lobby OR game depending on state in here -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  setup() {},
});
</script>

<style lang="scss" scoped></style>
