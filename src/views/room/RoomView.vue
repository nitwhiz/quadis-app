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
        <div v-if="mainPlayer" :key="mainPlayer.gameId" class="game current-game">
          <GameDisplay
            :is-main="true"
            :player="mainPlayer"
          />
          <button v-if="mainPlayer.isHost" ref="start" class="start" @click="start">START</button>
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

<script lang="ts">
import { defineComponent } from 'vue';

import usePlayerCustomization from '../../composables/usePlayerCustomization';
import { useRoute } from 'vue-router';
import PlayerCustomization from '../../components/PlayerCustomization.vue';
import GameDisplay from '../../components/GameDisplay.vue';
import RoomService from '../../quadis/room/RoomService';

import Player from '../../quadis/player/Player';
import { EVENT_ADD_PLAYER, EVENT_READY, EVENT_REMOVE_PLAYER, EVENT_ROOM_HAS_GAMES_RUNNING, EVENT_UPDATE_MAIN_PLAYER } from '../../quadis/event/ClientEvent';
import { BedrockTargetsUpdateEvent, EVENT_BEDROCK_TARGETS_UPDATE, EVENT_SCORE_UPDATE, ScoreUpdateEvent } from '../../quadis/event/ServerEvent';

export default defineComponent({
  components: {
    PlayerCustomization,
    GameDisplay,
  },
  setup() {
    const { params } = useRoute();
    const { playerName, isConfirmed } = usePlayerCustomization();

    return {
      roomId: params.roomId as string,
      playerName,
      isConfirmed
    };
  },
  data() {
    return {
      error: null as 'room_has_running_games' | null,
      mainPlayer: null as Player | null,
      opponents: [] as Player[],
      currentBedrockTargetId: null as string | null
    };
  },
  computed: {
    errorMessage() {
      switch (this.error) {
        case 'room_has_running_games':
          return 'The game is already started';
        default:
          return '';
      }
    },
  },
  mounted() {
    if (this.isConfirmed) {
      this.handlePlayerCustomizationConfirmation();
    }
  },
  methods: {
    start() {
      RoomService.getInstance().start();
    },
    handlePlayerCustomizationConfirmation() {
      this.error = null;

      const roomService = RoomService.getInstance(this.roomId);

      roomService.on(EVENT_READY, () => {
        this.isConfirmed = true;
      });

      roomService.on(EVENT_ADD_PLAYER, (player: Player) => {
        this.opponents.push(player);
      });

      roomService.on(EVENT_REMOVE_PLAYER, (playerId: string) => {
        this.opponents = this.opponents.filter(p => p.gameId !== playerId);
      });

      roomService.on(EVENT_UPDATE_MAIN_PLAYER, (player: Player) => {
        this.mainPlayer = player;
      })

      roomService.on(EVENT_ROOM_HAS_GAMES_RUNNING, () => {
        this.error = 'room_has_running_games';
      });

      roomService.on(EVENT_BEDROCK_TARGETS_UPDATE, (event: BedrockTargetsUpdateEvent) => {
        if (this.mainPlayer && event.payload.targets[this.mainPlayer.gameId]) {
          this.currentBedrockTargetId = event.payload.targets[this.mainPlayer.gameId];
        } else {
          this.currentBedrockTargetId = null;
        }
      });

      roomService.on(EVENT_SCORE_UPDATE, (event: ScoreUpdateEvent) => {
        if (event.origin.id === this.mainPlayer?.gameId) {
          this.mainPlayer.score.score = event.payload.score;
          this.mainPlayer.score.lines = event.payload.lines;
        }
      });

      roomService.connect(this.playerName);
    },
  },
});
</script>

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
