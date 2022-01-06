<template>hello bloccs!</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

interface RoomResponse {
  roomId: string;
}

export default defineComponent({
  mounted(): void {
    axios.post<RoomResponse>('http://localhost:7000/rooms').then((response) => {
      this.$router.replace(`/rooms/${response.data.roomId}`);
    });
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
