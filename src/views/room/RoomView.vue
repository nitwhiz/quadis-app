<template>
  <div v-if="!isConfirmed" class="player">
    <PlayerCustomization
      type="join"
      @confirm="handlePlayerCustomizationConfirmation"
    />
  </div>
  <div v-else class="room">
    <div class="games">
      <div v-if="currentPlayer" class="game current-game">
        <GameDisplay
          :is-main="true"
          :room-service="roomService"
          :player="currentPlayer"
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
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import RoomService, {
  CLIENT_EVENT_GAME_OVER,
  CLIENT_EVENT_UPDATE_PLAYERS,
  Player,
} from '../../bloccs/RoomService';
import usePlayerCustomization from '../../composables/usePlayerCustomization';
import { useRoute } from 'vue-router';
import PlayerCustomization from '../../components/PlayerCustomization.vue';
import GameDisplay from '../../components/GameDisplay.vue';

export default defineComponent({
  components: {
    PlayerCustomization,
    GameDisplay,
  },
  setup() {
    const { params } = useRoute();
    const { playerName, isConfirmed } = usePlayerCustomization();

    const players = ref([] as Player[]);
    const currentPlayer = computed(() => players.value[0] || null);
    const otherPlayers = computed(() => [...players.value].splice(1));

    const gameOverPlayers = ref([] as string[]);

    return {
      players,
      currentPlayer,
      otherPlayers,
      roomId: params.roomId as string,
      playerName,
      isConfirmed,
      gameOverPlayers,
    };
  },
  data() {
    return {
      roomService: null as RoomService | null,
    };
  },
  mounted() {
    if (this.isConfirmed) {
      this.handlePlayerCustomizationConfirmation();
    }
  },
  methods: {
    handlePlayerCustomizationConfirmation() {
      this.roomService = new RoomService(this.playerName, this.roomId);

      this.roomService.on(CLIENT_EVENT_UPDATE_PLAYERS, (players: Player[]) => {
        this.players = players;
      });

      this.roomService.on(CLIENT_EVENT_GAME_OVER, (playerId) => {
        this.gameOverPlayers.push(playerId);
      });

      this.roomService.connect();
    },
  },
});
</script>

<style lang="scss" scoped>
.player {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
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
