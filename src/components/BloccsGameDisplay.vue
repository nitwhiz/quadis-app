<template>
  <canvas ref="canvas">huh?</canvas>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from 'vue';
import useRoomService from '../composables/useRoomService';
import BloccsApplication from '../game/BloccsApplication';
import { GameUpdateData } from '../game/RoomService';

export default defineComponent({
  props: {
    playerId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { service } = useRoomService();

    return {
      service,
    };
  },
  data() {
    return {
      app: null as BloccsApplication | null,
    };
  },
  mounted(): void {
    this.destroyApp();

    const view = this.$refs.canvas as HTMLCanvasElement;

    this.app = new BloccsApplication(view);

    this.service?.addListener(
      'room_player_game_update',
      (data: GameUpdateData) => {
        if (this.app) {
          this.app.setField(data.field);
        }
      },
    );

    this.app.start();
  },
  unmounted(): void {
    this.destroyApp();
  },
  methods: {
    destroyApp(): void {
      console.log('destroying app');

      this.app?.stop();

      this.app?.destroy(true, {
        baseTexture: true,
        children: true,
        texture: true,
      });
    },
  },
});
</script>

<style scoped lang="scss">
canvas {
  border: 1px solid black;
}
</style>
