<script setup lang="ts">
import { onMounted, onUnmounted, PropType, ref } from 'vue';
import Player from '../quadis/player/Player';
import GameContainer from '../quadis/game/GameContainer';
import { useRoomService } from '../composables/useRoomService';
import { useGameHost } from '../composables/useGameHost';

const roomService = await useRoomService();
const gameHost = useGameHost();

const props = defineProps({
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
    default: false,
  },
});

const gameWrapper = ref<HTMLDivElement | null>(null);
const nextPieceWrapper = ref(null);
const holdingPieceWrapper = ref(null);

const score = ref(props.player.score);
let game: GameContainer | null = null;

onMounted(() => {
  console.log('mount.');

  const gameContainer = new GameContainer(
    props.player,
    {
      gameContainer: gameWrapper.value as HTMLDivElement,
      nextPieceContainer: nextPieceWrapper.value,
      holdingPieceContainer: holdingPieceWrapper.value,
    },
    roomService,
  );

  gameHost.addGame(gameContainer);

  game = gameContainer;
});

onUnmounted(() => {
  console.log('unmount.');

  gameHost.removeGame(game?.getId() ?? 'dead-beef');
});
</script>

<template>
  <div
    :data-player-id="player.gameId"
    class="game-display"
    :class="[isMain ? 'main' : undefined, isTarget ? 'is-target' : undefined]"
  >
    <div class="game-wrapper">
      <div class="player">{{ player.name }}</div>
      <div class="score-line">SCORE {{ score.score }}</div>
      <div class="score-line">LINES {{ score.lines }}</div>
      <div ref="gameWrapper" class="game-canvas"></div>
    </div>
    <div v-if="isMain" class="meta">
      <div class="next">NEXT</div>
      <div ref="nextPieceWrapper" class="next-piece"></div>
      <div class="hold">HOLD</div>
      <div ref="holdingPieceWrapper" class="holding-piece"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-display {
  display: flex;
  flex-direction: row;

  background-color: #555;
  padding: 16px;

  border: 3px solid transparent;
  border-radius: 3px;

  &.is-target {
    border-color: rgba(255, 0, 0, 0.5);
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
