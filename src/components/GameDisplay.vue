<template>
  <div
    class="game-display"
    :class="[
      isMain ? 'main' : undefined,
      isGameOver ? 'game-over' : 'game-running',
    ]"
  >
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
    <div class="overlay-wrapper">GAME<br />OVER</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Game from '../bloccs/game/Game';
import useRoomService from '../composables/useRoomService';
import {
  EVENT_GAME_OVER,
  PLAYER_UPDATE_SCORE,
} from '../bloccs/event/EventType';
import Score from '../bloccs/score/Score';
import { PlayerGameOverPayload } from '../bloccs/event/EventPayload';

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

    const isGameOver = ref(false);

    roomService.value?.addListener(
      EVENT_GAME_OVER,
      (payload: PlayerGameOverPayload) => {
        if (props.playerId === payload.player.id) {
          isGameOver.value = true;
        }
      },
    );

    const player = computed(
      () => roomService.value?.getPlayerById(props.playerId) || null,
    );

    if (player.value === null) {
      throw 'player is null';
    }

    const score = ref(0);
    const lines = ref(0);

    // todo: whack design
    player.value?.addListener(PLAYER_UPDATE_SCORE, (newScore: Score) => {
      score.value = newScore.score;
      lines.value = newScore.lines;
    });

    return {
      roomService,
      player,
      score,
      lines,
      isGameOver,
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

  position: relative;

  .meta {
    padding-left: 12px;
  }

  &.main {
    .player {
      color: gold;
    }
  }

  .overlay-wrapper {
    position: absolute;

    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: rgba(10, 0, 0, 0.75);

    font-size: 32px;
    line-height: 48px;
  }

  &.main {
    .overlay-wrapper {
      font-size: 58px;
      line-height: 82px;
    }
  }

  &.game-running {
    .overlay-wrapper {
      display: none;
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
