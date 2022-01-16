<template>
  <div class="game-display">
    <div class="player">{{ player.name }}</div>
    <div class="canvas">
      <canvas ref="canvas">huh?</canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BloccsGame, { PieceType } from '../bloccs/BloccsGame';
import RoomService, {
  EventMessage,
  FallingPieceUpdateData,
  GameUpdateData,
} from '../bloccs/RoomService';
import { Player } from '../bloccs/RoomService';

export default defineComponent({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    roomService: {
      type: RoomService,
      required: true,
    },
  },
  mounted() {
    const canvas = this.$refs.canvas as HTMLCanvasElement;

    const game = new BloccsGame(canvas, 20);

    // register handlers for specific ids; room service listens once
    this.roomService.on(
      'room_player_update_falling_piece',
      (event: EventMessage<FallingPieceUpdateData>) => {
        if (event.channel === 'update/' + this.player.id) {
          game.setFallingPieceData(
            event.payload.falling_piece_data.current_piece.name as PieceType,
            event.payload.falling_piece_data.current_piece.rotation,
            event.payload.falling_piece_data.x,
            event.payload.falling_piece_data.y,
            event.payload.piece_display,
          );
        }
      },
    );

    this.roomService.on(
      'room_player_game_update',
      (event: EventMessage<GameUpdateData>) => {
        if (event.channel === 'update/' + this.player.id) {
          game.setFieldData(
            event.payload.field.width,
            event.payload.field.height,
            event.payload.field.data,
          );
        }
      },
    );

    this.roomService.on('room_game_start', () => {
      console.log('start');
      game.app.start();
    });
  },
});
</script>

<style lang="scss" scoped>
canvas {
  border: 1px solid black;
}
</style>
