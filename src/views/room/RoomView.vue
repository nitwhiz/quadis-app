<template>
  <div v-if="!isConfirmed" class="player">
    <PlayerCustomization @confirm="handlePlayerCustomizationConfirmation" />
  </div>
  <div v-else class="room">
    room.
    <div class="games">
      <div v-for="p in players" :key="p.id" class="game">
        {{ p.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import RoomService, {
  HelloAck,
  Player,
  PlayerJoinData,
  PlayerLeaveData,
} from '../../bloccs/RoomService';
import usePlayerCustomization from '../../composables/usePlayerCustomization';
import { useRoute } from 'vue-router';
import PlayerCustomization from '../../components/PlayerCustomization.vue';

export default defineComponent({
  components: {
    PlayerCustomization,
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
  methods: {
    handlePlayerCustomizationConfirmation() {
      const roomService = new RoomService(this.playerName, this.roomId);

      roomService.on('room_player_join', (payload: PlayerJoinData) => {
        this.players[payload.player.id] = payload.player;
      });

      roomService.on('room_player_leave', (payload: PlayerLeaveData) => {
        delete this.players[payload.player.id];
      });

      roomService.on('hello_ack', (payload: HelloAck) => {
        this.players = payload.room.players;
      });

      roomService.connect();
    },
  },
});
</script>

<style scoped></style>
