<script setup lang="ts">
import PlayerCustomization from '../../components/PlayerCustomization.vue';
import GameDisplay from '../../components/GameDisplay.vue';
import ScoresDisplay from '../../components/ScoresDisplay.vue';
import { useRoute, useRouter } from 'vue-router';
import usePlayerCustomization from '../../composables/usePlayerCustomization';
import Player from '../../quadis/player/Player';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  TargetsUpdateEvent,
  RoomScoresEvent,
  ScoreUpdateEvent,
  ServerEventType,
} from '../../quadis/event/ServerEvent';
import { ClientEventType } from '../../quadis/event/ClientEvent';
import Score from '../../quadis/score/Score';
import GameHost from '../../quadis/game/GameHost';
import RoomService from '../../quadis/room/RoomService';

const { params } = useRoute();
const router = useRouter();
const roomService = await RoomService.getInstance();

roomService.setRoomId(params.roomId as string);

const roomAvailable = await roomService.checkRoom();

if (!roomAvailable) {
  router.push({ name: 'home' });
}

const gameHost = GameHost.getInstance();

const { playerName, isConfirmed } = usePlayerCustomization();

const error = ref(null as 'room_has_running_games' | null);
const mainPlayer = ref(null as Player | null);
const opponents = ref([] as Player[]);
const currentBedrockTargetId = ref(null as string | null);
const scores = ref(
  [] as { gameId: string; playerName: string; score: Score }[],
);
const showScores = ref(false);

const errorMessage = computed(() => {
  switch (error.value) {
    case 'room_has_running_games':
      return 'The game is already started';
    default:
      return '';
  }
});

const handlePlayerCustomizationConfirmation = () => {
  error.value = null;

  roomService.on(ClientEventType.READY, () => {
    isConfirmed.value = true;
  });

  roomService.on(ClientEventType.ADD_PLAYER, (player: Player) => {
    opponents.value.push(player);
  });

  roomService.on(ClientEventType.REMOVE_PLAYER, (playerId: string) => {
    opponents.value = opponents.value.filter((p) => p.gameId !== playerId);
  });

  roomService.on(ClientEventType.UPDATE_MAIN_PLAYER, (player: Player) => {
    mainPlayer.value = player;
  });

  roomService.on(ClientEventType.ROOM_HAS_GAMES_RUNNING, () => {
    error.value = 'room_has_running_games';
  });

  roomService.on(
    ServerEventType.TARGETS_UPDATE,
    (event: TargetsUpdateEvent) => {
      if (mainPlayer.value && event.payload.targets[mainPlayer.value.gameId]) {
        currentBedrockTargetId.value =
          event.payload.targets[mainPlayer.value.gameId];
      } else {
        currentBedrockTargetId.value = null;
      }
    },
  );

  // todo: scores should be kept in `Game`s
  roomService.on(ServerEventType.SCORE_UPDATE, (event: ScoreUpdateEvent) => {
    if (event.origin.id === mainPlayer.value?.gameId) {
      mainPlayer.value.score.score = event.payload.score;
      mainPlayer.value.score.lines = event.payload.lines;
    }
  });

  roomService.on(ServerEventType.ROOM_SCORES, (event: RoomScoresEvent) => {
    scores.value = [];

    for (const scoreData of event.payload) {
      scores.value.push({
        gameId: scoreData.game.id,
        playerName: scoreData.game.playerName,
        score: scoreData.score,
      });
    }

    gameHost.hide();
    showScores.value = true;
  });

  roomService.connect(playerName.value);
};

const hideScores = () => {
  showScores.value = false;
  gameHost.show();
};

const handleGameStart = (e: KeyboardEvent) => {
  if (
    e.key === ' ' &&
    mainPlayer.value?.isHost &&
    !showScores.value &&
    !roomService.isMainGameRunning
  ) {
    roomService.start();
  }
};

onMounted(() => {
  if (isConfirmed.value) {
    handlePlayerCustomizationConfirmation();
  }

  document.addEventListener('keydown', handleGameStart);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGameStart);
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
  <template v-if="showScores">
    <ScoresDisplay :scores="scores" @close="hideScores" />
  </template>
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
  width: 100%;
  padding: 0 64px;

  .games {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;

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

      width: 100%;
    }
  }
}
</style>
