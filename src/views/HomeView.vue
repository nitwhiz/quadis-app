<template>
  <PlayerCustomization @confirm="handlePlayerCustomizationConfirmation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import PlayerCustomization from '../components/PlayerCustomization.vue';

export default defineComponent({
  components: {
    PlayerCustomization,
  },
  methods: {
    handlePlayerCustomizationConfirmation() {
      axios.post('http://localhost:7000/rooms').then((response) => {
        this.$router.push({
          name: 'room',
          params: {
            roomId: response.data.roomId,
          },
        });
      });
    },
  },
});
</script>

<style scoped></style>
