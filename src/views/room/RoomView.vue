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
          <GameDisplay
            :is-main="true"
            :room-service="roomService"
            :player="mainPlayer"
          />
          <button class="start" @click="roomService.start()">start</button>
        </div>
        <div class="other-games">
          <div v-for="p in otherPlayers" :key="p.id" class="game other-game">
            <GameDisplay
              :is-main="false"
              :room-service="roomService"
              :player="p"
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
import RoomService from '../../bloccs/room/RoomService';
import {
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_SUCCESSFUL_HELLO,
  EVENT_UPDATE_PLAYERS,
} from '../../bloccs/event/EventType';
import Player from '../../bloccs/player/Player';

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
      isConfirmed,
    };
  },
  data() {
    return {
      roomService: null as RoomService | null,
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
      this.roomService = new RoomService(this.roomId);

      this.roomService.on(EVENT_SUCCESSFUL_HELLO, () => {
        this.isConfirmed = true;
      });

      this.roomService.on(EVENT_UPDATE_PLAYERS, () => {
        if (this.roomService) {
          this.mainPlayer = this.roomService?.getMainPlayer();
          this.otherPlayers = this.roomService?.getOtherPlayers();
        }
      });

      this.roomService.on(EVENT_ROOM_HAS_GAMES_RUNNING, () => {
        this.error = 'room_has_running_games';
      });

      this.roomService.connect(this.playerName);
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
