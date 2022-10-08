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
          <div v-for="p in opponents" :key="p.id" class="game other-game">
            <GameDisplay
              :is-main="false"
              :room-service="roomService"
              :player="p"
              :is-target="currentBedrockTargetId === p.id"
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
  EVENT_ADD_PLAYER,
  EVENT_REMOVE_PLAYER,
  EVENT_ROOM_HAS_GAMES_RUNNING,
  EVENT_SUCCESSFUL_HELLO,
  EVENT_UPDATE_MAIN_PLAYER, SERVER_EVENT_UPDATE_BEDROCK_TARGETS
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
      isConfirmed
    };
  },
  data() {
    return {
      roomService: null as RoomService | null,
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
    handlePlayerCustomizationConfirmation() {
      this.error = null;

      if (this.roomService !== null) {
        this.roomService.removeAllListeners();
        this.roomService = null;
      }

      this.roomService = new RoomService(this.roomId);

      this.roomService.on(EVENT_SUCCESSFUL_HELLO, () => {
        this.isConfirmed = true;
      });

      this.roomService.on(EVENT_ADD_PLAYER, (player: Player) => {
        this.opponents.push(player);
      });

      this.roomService.on(EVENT_REMOVE_PLAYER, (playerId: string) => {
        this.opponents = this.opponents.filter(p => p.id !== playerId);
      });

      this.roomService.on(EVENT_UPDATE_MAIN_PLAYER, (player: Player) => {
        this.mainPlayer = player;
      })

      this.roomService.on(EVENT_ROOM_HAS_GAMES_RUNNING, () => {
        this.error = 'room_has_running_games';
      });

      this.roomService.on(SERVER_EVENT_UPDATE_BEDROCK_TARGETS, (bedrockTargetMap: Record<string, string>) => {
        if (this.mainPlayer && bedrockTargetMap[this.mainPlayer.id]) {
          this.currentBedrockTargetId = bedrockTargetMap[this.mainPlayer.id];
        } else {
          this.currentBedrockTargetId = null;
        }
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
