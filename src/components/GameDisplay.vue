<template>
  <div class="game-display" :class="isMain ? 'main' : undefined">
    <div class="player">{{ player.name }}</div>
    <div class="canvas">
      <canvas ref="canvas">huh?</canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Game from '../bloccs/Game';
import RoomService from '../bloccs/RoomService';
import { Player } from '../bloccs/RoomService';

export default defineComponent({
  props: {
    isMain: {
      type: Boolean,
      required: true,
    },
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    roomService: {
      type: RoomService,
      required: true,
    },
  },
  mounted() {
    const canvas = this.$refs.canvas as HTMLCanvasElement;

    const game = new Game(canvas, this.isMain ? 24 : 16);

    this.roomService.registerGame(this.player.id, game);
  },
});
</script>

<style lang="scss" scoped>
.game-display {
  .player {
    margin-bottom: 12px;
  }

  canvas {
    border: 1px solid black;
  }
}
</style>
