<template>
  <div class="customization">
    <div class="name">
      <div class="label">Name:</div>
      <div class="input">
        <input v-model="playerName" type="text" name="name" />
      </div>
      <div class="controls">
        <button @click="confirm">confirm</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import usePlayerCustomization from '../composables/usePlayerCustomization';

export default defineComponent({
  emits: ['confirm'],
  setup() {
    const { playerName, isConfirmed } = usePlayerCustomization();

    return {
      playerName,
      isConfirmed,
    };
  },
  methods: {
    confirm() {
      this.isConfirmed = true;
      this.$emit('confirm');
    },
  },
});
</script>

<style scoped></style>
