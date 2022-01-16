<template>
  <PlayerCustomization
    type="create"
    @confirm="handlePlayerCustomizationConfirmation"
  />
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
      axios
        .post(`http://${import.meta.env.VITE_GAME_SERVER}/rooms`)
        .then((response) => {
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
