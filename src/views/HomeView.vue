<template>
  <div class="home">
    <div class="name-input-wrapper">
      <input type="text" name="name" @input="updatePlayerName" />
    </div>
    <div class="new-room-button-wrapper">
      <a class="new-room" href="javascript:void(0);" @click="createRoom"
        >create room</a
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import usePlayerName from '../composables/usePlayerName';

interface RoomResponse {
  roomId: string;
}

export default defineComponent({
  setup() {
    const { playerName, updatePlayerName } = usePlayerName();

    return {
      playerName,
      updatePlayerName,
    };
  },
  methods: {
    createRoom() {
      axios
        .post<RoomResponse>('http://localhost:7000/rooms')
        .then((response) => {
          this.$router.push(`/rooms/${response.data.roomId}`);
        });
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
      padding: 12px;

      font-size: 24px;

      background-color: lighten(#84909c, 10%);
      border: none;

      border-bottom: 2px solid #2c3e50;

      outline: none;

      text-align: center;
    }
  }

  .new-room-button-wrapper {
    .new-room {
      color: #f1f1f1;
      text-decoration: none;

      display: block;

      padding: 8px 24px;
      background-color: #2c3e50;

      font-size: 48px;

      box-shadow: 6px 6px 0 black;

      &:hover {
        background-color: lighten(#2c3e50, 5%);
      }
    }
  }
}
</style>
