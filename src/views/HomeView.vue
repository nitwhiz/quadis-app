<script setup lang="ts">
import PlayerCustomization from '../components/PlayerCustomization.vue';

import axios from 'axios';
import { useRouter } from 'vue-router';
import RoomService from '../quadis/room/RoomService';

const router = useRouter();
const roomService = await RoomService.getInstance();

const handlePlayerCustomizationConfirmation = () => {
  axios.post(roomService.getUrl('http', 'rooms')).then((response) => {
    router.push({
      name: 'room',
      params: {
        roomId: response.data.roomId,
      },
    });
  });
};
</script>

<template>
  <PlayerCustomization
    type="create"
    @confirm="handlePlayerCustomizationConfirmation"
  />
</template>
