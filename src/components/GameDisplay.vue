<template>
  <div
      :data-player-id="player.gameId"
      class="game-display"
      :class="[
          isMain ? 'main' : undefined,
          isTarget ? 'is-target' : undefined
      ]"
  >
    <div class="game-wrapper">
      <div class="player">{{ player.name }}</div>
      <div class="score-line">SCORE {{ score.score }}</div>
      <div class="score-line">LINES {{ score.lines }}</div>
      <div ref="game" class="game-canvas"></div>
    </div>
    <div v-if="isMain" class="meta">
      <div class="next">NEXT</div>
      <div ref="nextPiece" class="next-piece"></div>
      <div class="hold">HOLD</div>
      <div ref="holdingPiece" class="holding-piece"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import Player from '../quadis/player/Player';
import RoomService from '../quadis/room/RoomService';
import GameHost from '../quadis/game/GameHost';
import GameContainer from '../quadis/game/GameContainer';

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
    isTarget: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const score = ref(props.player.score);
    const gameHost = GameHost.getInstance();

    return {
      score,
      gameHost
    };
  },
  data() {
    return {
      game: null as GameContainer | null
    }
  },
  mounted() {
    console.log('mount.');

    const game = new GameContainer(this.player, {
      gameContainer: this.$refs.game as HTMLDivElement,
      nextPieceContainer: this.$refs.nextPiece as HTMLDivElement | undefined,
      holdingPieceContainer: this.$refs.holdingPiece as HTMLDivElement | undefined
    }, RoomService.getInstance());

    this.gameHost.addGame(game);

    this.game = game;
  },
  unmounted() {
    console.log('unmount.');

    this.gameHost.removeGame(this.game?.getId() || 'dead-beef');
  },
});
</script>

<style lang="scss" scoped>
.game-display {
  display: flex;
  flex-direction: row;

  background-color: #555;
  padding: 16px;

  border: 3px solid transparent;
  border-radius: 3px;

  &.is-target {
    border-color: rgba(255, 0, 0, .5);
  }

  .meta {
    padding-left: 12px;
  }

  &.main {
    .player {
      color: gold;
    }
  }

  .game-wrapper {
    .game-canvas {
      background: black;
    }
  }

  .next-piece,
  .holding-piece {
    background: black;
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
}
</style>
