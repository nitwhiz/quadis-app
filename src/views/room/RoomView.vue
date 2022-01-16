<template>
  <div v-if="!isConfirmed" class="player">
    <PlayerCustomization @confirm="handlePlayerCustomizationConfirmation" />
  </div>
  <div v-else class="room">
    <button @click="roomService.start()">start</button>
    players:
    <div class="games">
      <div v-for="p in players" :key="p.id" class="game">
        <GameDisplay :room-service="roomService" :player="p" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RoomService, {
  EventMessage,
  HelloAck,
  Player,
  PlayerJoinData,
  PlayerLeaveData,
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

    const players = ref({} as Record<string, Player>);

    return {
      players,
      roomId: params.roomId as string,
      playerName,
      isConfirmed,
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

      this.roomService.on(
        'room_player_join',
        (event: EventMessage<PlayerJoinData>) => {
          this.players[event.payload.player.id] = event.payload.player;
        },
      );

      this.roomService.on(
        'room_player_leave',
        (event: EventMessage<PlayerLeaveData>) => {
          delete this.players[event.payload.player.id];
        },
      );

      this.roomService.on('hello_ack', (event: EventMessage<HelloAck>) => {
        this.players = event.payload.room.players;
      });

      this.roomService.connect();
    },
  },
});
</script>

<style scoped></style>
