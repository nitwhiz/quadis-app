<template>
  <PlayerName v-if="!playerNameConfirmed" :is-join="isJoin" @confirm="init" />
  <div
    v-else-if="canvasView !== null"
    ref="canvasHolder"
    class="canvas-holder"
  ></div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import usePlayerName from '../../composables/usePlayerName';
import PlayerName from '../../components/PlayerName.vue';
import useGameHost from '../../composables/useGameHost';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  components: {
    PlayerName,
  },
  setup() {
    const { isConfirmed, playerName } = usePlayerName();
    const { load, canvasView } = useGameHost();
    const { params } = useRoute();
    const { push } = useRouter();

    const isJoin = computed(() => params.roomId !== 'new');

    return {
      load,
      canvasView,
      playerName,
      playerNameConfirmed: isConfirmed,
      params,
      push,
      isJoin,
    };
  },
  methods: {
    init() {
      let roomId: string | undefined = this.params.roomId as string;

      if (roomId === 'new') {
        roomId = undefined;
      }

      this.load(this.playerName, roomId).then((room) => {
        console.log('loaded');

        if (this.canvasView) {
          (this.$refs.canvasHolder as HTMLCanvasElement).append(
            this.canvasView,
          );
        }

        if (roomId === undefined) {
          this.push({
            name: 'room',
            params: {
              roomId: room.id,
            },
          });
        }
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.canvas-holder {
  width: 100%;
  height: 100%;

  overflow: hidden;
}
</style>
