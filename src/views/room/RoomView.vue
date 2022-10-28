<script setup lang="ts">
import PlayerCustomization from '../../components/PlayerCustomization.vue';
import GameDisplay from '../../components/GameDisplay.vue';
import { useRoute } from 'vue-router';
import usePlayerCustomization from '../../composables/usePlayerCustomization';
import Player from '../../quadis/player/Player';
import { computed, onMounted, ref } from 'vue';
import RoomService from '../../quadis/room/RoomService';
import {
  EVENT_ADD_PLAYER,
  EVENT_READY,
  EVENT_REMOVE_PLAYER,
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_UPDATE_MAIN_PLAYER,
} from '../../quadis/event/ClientEvent';
import {
  BedrockTargetsUpdateEvent,
  EVENT_BEDROCK_TARGETS_UPDATE,
  EVENT_SCORE_UPDATE,
  ScoreUpdateEvent,
} from '../../quadis/event/ServerEvent';

const { params } = useRoute();
const { playerName, isConfirmed } = usePlayerCustomization();

const roomId = params.roomId as string;

const error = ref(null as 'room_has_running_games' | null);
const mainPlayer = ref(null as Player | null);
const opponents = ref([] as Player[]);
const currentBedrockTargetId = ref(null as string | null);

const errorMessage = computed(() => {
  switch (error.value) {
    case 'room_has_running_games':
      return 'The game is already started';
    default:
      return '';
  }
});

const start = () => {
  RoomService.getInstance().start();
};

const handlePlayerCustomizationConfirmation = () => {
  error.value = null;

  const roomService = RoomService.getInstance(roomId);

  roomService.on(EVENT_READY, () => {
    isConfirmed.value = true;
  });

  roomService.on(EVENT_ADD_PLAYER, (player: Player) => {
    opponents.value.push(player);
  });

  roomService.on(EVENT_REMOVE_PLAYER, (playerId: string) => {
    opponents.value = opponents.value.filter((p) => p.gameId !== playerId);
  });

  roomService.on(EVENT_UPDATE_MAIN_PLAYER, (player: Player) => {
    mainPlayer.value = player;
  });

  roomService.on(EVENT_ROOM_HAS_GAMES_RUNNING, () => {
    error.value = 'room_has_running_games';
  });

  roomService.on(
    EVENT_BEDROCK_TARGETS_UPDATE,
    (event: BedrockTargetsUpdateEvent) => {
      if (mainPlayer.value && event.payload.targets[mainPlayer.value.gameId]) {
        currentBedrockTargetId.value =
          event.payload.targets[mainPlayer.value.gameId];
      } else {
        currentBedrockTargetId.value = null;
      }
    },
  );

  roomService.on(EVENT_SCORE_UPDATE, (event: ScoreUpdateEvent) => {
    if (event.origin.id === mainPlayer.value?.gameId) {
      mainPlayer.value.score.score = event.payload.score;
      mainPlayer.value.score.lines = event.payload.lines;
    }
  });

  roomService.connect(playerName.value);
};

onMounted(() => {
  if (isConfirmed.value) {
    handlePlayerCustomizationConfirmation();
  }
});
</script>

<template>
  <div class="wrapper">
    <div v-if="error" class="error">
      {{ errorMessage }}
    </div>
    <div v-if="!isConfirmed" class="player">
      <PlayerCustomization
        type="join"
        @confirm="handlePlayerCustomizationConfirmation"
      />
    </div>
    <div class="room">
      <div class="games">
        <div
          v-if="mainPlayer"
          :key="mainPlayer.gameId"
          class="game current-game"
        >
          <GameDisplay :is-main="true" :player="mainPlayer" />
          <button
            v-if="mainPlayer.isHost"
            ref="start"
            class="start"
            @click="start"
          >
            START
          </button>
        </div>
        <div class="other-games">
          <div v-for="p in opponents" :key="p.gameId" class="game other-game">
            <GameDisplay
              :is-main="false"
              :player="p"
              :is-target="currentBedrockTargetId === p.gameId"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  .error {
    margin-bottom: 32px;

    color: #990000;
  }
}

.room {
  .games {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .game {
      margin: 12px;

      &.current-game {
        button.start {
          margin: 12px;
        }
      }
    }

    .other-games {
      display: flex;
      flex-wrap: wrap;
    }
  }
}
</style>
