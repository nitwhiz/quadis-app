<template>
  <!--  <div class="controls">-->
  <!--    <button @click="$router.replace('/')">back</button>-->
  <!--    <button @click="service?.startGame()">start</button>-->
  <!--  </div>-->
  <div class="games">
    <div
      v-for="p in players"
      :key="p.id"
      class="game-wrapper"
      :class="gameCls(p)"
    >
      <BloccsGameDisplay :player-id="p.id" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useRoomService from '../composables/useRoomService';
import { useRoute } from 'vue-router';
import BloccsGameDisplay from '../components/BloccsGameDisplay.vue';
import { Player } from '../game/RoomService';
import usePlayerName from '../composables/usePlayerName';

export default defineComponent({
  components: {
    BloccsGameDisplay,
  },
  setup() {
    const { params } = useRoute();

    const { playerName } = usePlayerName();

    const { service, destroyService, players, controllingPlayerId } =
      useRoomService(playerName.value, params.roomId as string);

    return {
      service,
      destroyService,
      players,
      controllingPlayerId,
    };
  },
  unmounted() {
    this.destroyService();
  },
  methods: {
    gameCls(p: Player): string {
      return p.id === this.controllingPlayerId ? 'controlled' : 'opponent';
    },
  },
});
</script>

<style lang="scss" scoped>
.games {
  background-color: #84909c;

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-column-gap: 12px;
  grid-row-gap: 12px;

  .game-wrapper {
    &.controlled {
      grid-area: 1 / 1 / 3 / 3;
    }
  }
}
</style>
