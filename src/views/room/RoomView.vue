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
        <div v-if="mainPlayer" :key="mainPlayer.id" class="game current-game">
          <GameDisplay :is-main="true" :player-id="mainPlayer.id" />
          <button class="start" @click="() => roomService?.start()">
            start
          </button>
        </div>
        <div class="other-games">
          <div v-for="p in otherPlayers" :key="p.id" class="game other-game">
            <GameDisplay :is-main="false" :player-id="p.id" />
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
import {
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_SUCCESSFUL_HELLO,
  EVENT_UPDATE_PLAYERS,
} from '../../bloccs/event/EventType';
import Player from '../../bloccs/player/Player';
import useRoomService from '../../composables/useRoomService';

export default defineComponent({
  components: {
    PlayerCustomization,
    GameDisplay,
  },
  setup() {
    const { params } = useRoute();
    const { playerName, isConfirmed } = usePlayerCustomization();
    const { createRoomService, roomService } = useRoomService();

    return {
      roomId: params.roomId as string,
      playerName,
      isConfirmed,
      createRoomService,
      roomService,
    };
  },
  data() {
    return {
      error: null as 'room_has_running_games' | null,
      mainPlayer: null as Player | null,
      otherPlayers: [] as Player[],
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
    handlePlayerCustomizationConfirmation() {
      const roomService = this.createRoomService(this.roomId);

      roomService.on(EVENT_SUCCESSFUL_HELLO, () => {
        this.isConfirmed = true;
      });

      roomService.on(EVENT_UPDATE_PLAYERS, () => {
        this.mainPlayer = roomService.getMainPlayer();
        this.otherPlayers = roomService.getOtherPlayers();
      });

      roomService.on(EVENT_ROOM_HAS_GAMES_RUNNING, () => {
        this.error = 'room_has_running_games';
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
    }
  }
}
</style>
