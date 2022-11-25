<script setup lang="ts">
import { onMounted, onUnmounted, PropType, ref } from 'vue';
import Player from '../quadis/player/Player';
import GameContainer from '../quadis/game/GameContainer';
import { DefaultLogger } from '../logger/Logger';
import {
  ItemAffectionUpdateEvent,
  ItemUpdateEvent,
  ServerEventType,
} from '../quadis/event/ServerEvent';
import { gameEventType } from '../quadis/event/GameEvent';
import GameHost from '../quadis/game/GameHost';
import RoomService from '../quadis/room/RoomService';
import { ItemType } from '../quadis/item/Item';

const roomService = await RoomService.getInstance();
const gameHost = GameHost.getInstance();

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
const nextPieceWrapper = ref<HTMLDivElement | null>(null);
const holdingPieceWrapper = ref<HTMLDivElement | null>(null);

const score = ref(props.player.score);
let game: GameContainer | null = null;

const currentItem = ref(null as ItemType | null);
const affectingItem = ref(ItemType.NONE);

const getItemUrl = (itemType: ItemType | null): string | undefined => {
  if (itemType) {
    return new URL(`../assets/items/${itemType}.png`, import.meta.url).href;
  }

  return undefined;
};

const getCurrentItemUrl = (): string | undefined => {
  return getItemUrl(currentItem.value);
};

const getAffectingItemUrl = (): string | undefined => {
  return getItemUrl(affectingItem.value);
};

onMounted(() => {
  DefaultLogger.debug('mount.');

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

  if (props.player.isMain) {
    roomService.on(
      gameEventType(ServerEventType.ITEM_UPDATE, game.getId()),
      (event: ItemUpdateEvent) => (currentItem.value = event.payload.type),
    );

    roomService.on(
      gameEventType(ServerEventType.ITEM_AFFECTION_UPDATE, game.getId()),
      (event: ItemAffectionUpdateEvent) => {
        affectingItem.value = event.payload.type;
      },
    );
  }
});

onUnmounted(() => {
  DefaultLogger.debug('unmount.');

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
      <div class="side-label">NEXT</div>
      <div ref="nextPieceWrapper" class="next-piece"></div>
      <div class="side-label">HOLD</div>
      <div ref="holdingPieceWrapper" class="holding-piece"></div>
      <div class="side-label">ITEM</div>
      <div class="item" :class="currentItem ? 'available' : undefined">
        <img v-if="currentItem" :src="getCurrentItemUrl()" alt="current item" />
      </div>
    </div>
    <div
      v-if="isMain && affectingItem !== ItemType.NONE"
      class="affecting-item"
    >
      <img :src="getAffectingItemUrl()" alt="affecting item" />
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

  position: relative;

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

  &:not(.main) {
    font-size: 8px;

    .player,
    .score-line {
      margin-bottom: 8px;
    }
  }

  .game-wrapper {
    .game-canvas {
      background: black;
    }
  }

  .next-piece,
  .holding-piece,
  .item {
    background: black;
  }

  .item {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 68px;
    height: 68px;

    &.available {
      background-color: #9c9c9c;
    }

    img {
      width: 56px;
      height: auto;
      image-rendering: pixelated;
    }
  }

  .player,
  .score-line {
    margin-bottom: 12px;
  }

  .side-label {
    text-align: right;

    margin: 16px 0;

    &:first-child {
      margin-top: 52px;
    }
  }

  @keyframes pulse {
    0% {
      scale: 0.9;
    }

    50% {
      scale: 1.1;
    }

    100% {
      scale: 0.9;
    }
  }

  .affecting-item {
    position: absolute;
    bottom: 0;
    right: 0;

    background-color: #444;
    transform: translate(30%, 30%) rotate(20deg);

    animation-name: pulse;
    animation-timing-function: linear;
    animation-duration: 1s;
    animation-iteration-count: infinite;

    display: flex;
    justify-content: center;
    align-items: center;

    width: 68px;
    height: 68px;

    img {
      width: 56px;
      height: auto;
      image-rendering: pixelated;
    }
  }
}
</style>
