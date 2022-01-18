<template>
  <div class="game-display" :class="isMain ? 'main' : undefined">
    <div class="game-wrapper">
      <div class="player">{{ player.name }}</div>
      <div class="score">{{ score }}</div>
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
import { defineComponent, PropType } from 'vue';
import Game, { GAME_EVENT_UPDATE_SCORE } from '../bloccs/Game';
import RoomService, { Player } from '../bloccs/RoomService';

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
  data() {
    return {
      game: null as Game | null,
      score: 0,
    };
  },
  computed: {},
  mounted() {
    const mainGameCanvas = this.$refs.gameCanvas as HTMLCanvasElement;
    const nextPieceCanvas = this.$refs.nextPieceCanvas as HTMLCanvasElement;
    const holdingPieceCanvas = this.$refs
      .holdingPieceCanvas as HTMLCanvasElement;

    const game = new Game(
      mainGameCanvas,
      nextPieceCanvas,
      holdingPieceCanvas,
      this.isMain ? 24 : 16,
    );

    game.on(GAME_EVENT_UPDATE_SCORE, (s) => (this.score = s));

    this.roomService.registerGame(this.player.id, game);
  },
  unmounted() {
    this.roomService.destroyGame(this.player.id);
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
  .score {
    margin-bottom: 12px;
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
