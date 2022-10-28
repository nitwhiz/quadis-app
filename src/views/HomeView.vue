<script setup lang="ts">
import PlayerCustomization from '../components/PlayerCustomization.vue';

import axios from 'axios';
import RoomService from '../quadis/room/RoomService';
import { useRouter } from 'vue-router';

const router = useRouter();

const handlePlayerCustomizationConfirmation = () => {
  axios
    .post(
      `${RoomService.tls ? 'https' : 'http'}://${RoomService.gameServer}/rooms`,
    )
    .then((response) => {
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
