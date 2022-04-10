<template>
  <div class="game-display" :class="isMain ? 'main' : undefined">
    <div class="game-wrapper">
      <div class="player">{{ player?.name || 'null' }}</div>
      <div class="score-line">SCORE {{ score }}</div>
      <div class="score-line">LINES {{ lines }}</div>
      <div class="canvas">
        <canvas ref="gameCanvas" />
      </div>
    </div>
    <div v-if="isMain" class="meta">
      <div class="next">NEXT</div>
      <div class="nextPiece">
        <canvas ref="nextPieceCanvas" width="80" height="80" />
      </div>
      <div class="hold">HOLD</div>
      <div class="holdingPiece">
        <canvas ref="holdingPieceCanvas" width="80" height="80" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Game from '../bloccs/game/Game';
import useRoomService from '../composables/useRoomService';

export default defineComponent({
  props: {
    isMain: {
      type: Boolean,
      required: true,
    },
    playerId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { roomService } = useRoomService();

    const player = computed(
      () => roomService.value?.getPlayerById(props.playerId) || null,
    );

    if (player.value === null) {
      throw 'player is null';
    }

    const score = computed(() => player.value?.score.score || 0);
    const lines = computed(() => player.value?.score.lines || 0);

    return {
      roomService,
      player,
      score,
      lines,
    };
  },
  mounted() {
    if (this.player === null) {
      throw 'player is null';
    }

    const mainGameCanvas = this.$refs.gameCanvas as HTMLCanvasElement;
    const nextPieceCanvas = this.$refs.nextPieceCanvas as HTMLCanvasElement;
    const holdingPieceCanvas = this.$refs
      .holdingPieceCanvas as HTMLCanvasElement;

    this.player.setGame(
      new Game({
        view: mainGameCanvas,
        nextPieceView: nextPieceCanvas,
        holdingPieceView: holdingPieceCanvas,
        blockSize: this.isMain ? 24 : 16,
      }),
    );

    this.roomService?.addPlayer(this.player);
  },
  unmounted() {
    this.roomService?.removePlayer(this.player?.id || null);
  },
});
</script>

<style lang="scss" scoped>
.game-display {
  display: flex;
  flex-direction: row;

  background-color: #555;
  padding: 16px;

  .meta {
    padding-left: 12px;
  }

  &.main {
    .player {
      color: gold;
    }
  }

  .player,
  .score-line {
    margin-bottom: 12px;
  }

  &:not(.main) {
    font-size: 8px;

    .player,
    .score-line {
      margin-bottom: 8px;
    }
  }

  .next {
    margin: 24px 0 16px 0;
  }

  .hold {
    margin: 16px 0;
  }

  .next,
  .hold {
    text-align: right;
  }

  canvas {
    border: 1px solid black;
  }
}
</style>
