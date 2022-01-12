<template>
  <div class="game">
    <div class="player-name">{{ player.name }}</div>
    <div class="canvas-wrapper">
      <canvas ref="canvas">{{ player.name }} canvas error</canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useRoomService from '../composables/useRoomService';
import { FallingPieceUpdateData, GameUpdateData } from '../game/RoomService';
import BloccsGame, { PieceType } from '../bloccs/BloccsGame';
import usePlayerName from '../composables/usePlayerName';

export default defineComponent({
  props: {
    playerId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { playerName } = usePlayerName();
    const { service, players, controllingPlayerId } =
      useRoomService(playerName);

    return {
      service,
      players,
      controllingPlayerId,
    };
  },
  data() {
    return {
      game: null as BloccsGame | null,
    };
  },
  computed: {
    player() {
      return this.players[this.playerId] || null;
    },
  },
  mounted(): void {
    this.destroyApp();

    const view = this.$refs.canvas as HTMLCanvasElement;

    this.game = new BloccsGame(view, 10);

    this.service?.addListener(
      'room_player_game_update',
      (data: GameUpdateData) => {
        if (this.game && data.field) {
          this.game.setFieldData(
            data.field.width,
            data.field.height,
            data.field.data,
          );
        }
      },
    );

    this.service?.addListener(
      'room_player_update_falling_piece',
      (data: FallingPieceUpdateData) => {
        if (this.game && data.falling_piece_data) {
          this.game.setFallingPieceData(
            data.falling_piece_data.current_piece.name as PieceType,
            data.falling_piece_data.current_piece.rotation,
            data.falling_piece_data.x,
            data.falling_piece_data.y,
            data.piece_display,
          );
        }
      },
    );

    this.game.app.start();
  },
  unmounted(): void {
    this.destroyApp();
  },
  methods: {
    destroyApp(): void {
      console.log('destroying app');

      this.game?.app?.stop();

      this.game?.app?.destroy(true, {
        baseTexture: true,
        children: true,
        texture: true,
      });
    },
  },
});
</script>

<style scoped lang="scss">
.game {
  width: auto;

  padding: 16px;
  margin: 20px;

  background-color: #2c3e50;

  box-shadow: 5px 5px 0 black;

  .player-name {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 8px;
  }

  .canvas-wrapper {
    canvas {
      border: 1px solid black;
      display: block;
    }
  }
}
</style>
