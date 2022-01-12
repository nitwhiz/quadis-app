<template>
  <div class="home">
    <div class="name-input-wrapper">
      <input
        v-model="playerName"
        type="text"
        name="name"
        placeholder="Your Name"
      />
    </div>
    <div class="button-wrapper">
      <a class="start-button" href="javascript:void(0);" @click="start">{{
        isJoin ? 'Join' : 'Start'
      }}</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import usePlayerName from '../composables/usePlayerName';
import { useRoute } from 'vue-router';
import useRoomService from '../composables/useRoomService';

interface CreateRoomResponse {
  roomId: string;
}

export default defineComponent({
  setup() {
    const { params } = useRoute();
    const { playerName, isConfirmed } = usePlayerName();
    const { ensureRoomService } = useRoomService();

    const roomId = (params.roomId || '') as string;
    const isJoin = Boolean(params.roomId);

    return {
      isConfirmed,
      roomId,
      isJoin,
      playerName,
      ensureRoomService,
    };
  },
  methods: {
    start() {
      this.isConfirmed = true;

      if (this.isJoin) {
        this.ensureRoomService(this.roomId);

        this.$router.push(`/rooms/${this.roomId}`);
      } else {
        axios
          .post<CreateRoomResponse>('http://localhost:7000/rooms')
          .then((response) => {
            this.ensureRoomService(response.data.roomId);

            this.$router.push(`/rooms/${response.data.roomId}`);
          });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .name-input-wrapper {
    margin-bottom: 24px;

    input {
      font-family: 'Press Start 2P', monospace;

      padding: 12px;

      font-size: 24px;

      background-color: lighten(#84909c, 10%);
      border: none;

      border-bottom: 2px solid #2c3e50;

      outline: none;

      text-align: center;

      width: 380px;
    }
  }

  .button-wrapper {
    .start-button {
      color: #f1f1f1;
      text-decoration: none;

      display: block;

      padding: 16px 24px;
      background-color: #2c3e50;

      font-size: 28px;

      box-shadow: 6px 6px 0 black;

      &:hover {
        background-color: lighten(#2c3e50, 5%);
      }
    }
  }
}
</style>
