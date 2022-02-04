<template>
  <div class="customization">
    <div class="name">
      <div class="label">ENTER NAME</div>
      <div class="input">
        <input
          v-model="playerName"
          type="text"
          name="name"
          placeholder="YOUR NAME"
        />
      </div>
      <div class="controls">
        <button @click="confirm">
          {{ type === 'join' ? 'JOIN' : 'CREATE' }} ROOM
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import usePlayerCustomization from '../composables/usePlayerCustomization';

export default defineComponent({
  props: {
    type: {
      type: String as PropType<'join' | 'create'>,
      default: 'create',
    },
  },
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
      if (this.type === 'create') {
        this.isConfirmed = true;
      }

      this.$emit('confirm');
    },
  },
});
</script>

<style lang="scss" scoped>
.customization {
  display: flex;

  width: 100%;
  height: 100%;

  justify-content: center;
  align-items: center;

  .name {
    .label {
      font-size: 20px;
      margin-bottom: 20px;

      text-align: center;
    }

    .input {
      input {
        font-size: 24px;
        text-align: center;

        width: 250px;
      }

      margin-bottom: 20px;
    }

    .controls {
      display: flex;
      justify-content: center;

      button {
        font-size: 18px;
      }
    }
  }
}
</style>
