<template>
  <div class="home">
    <PlayerCustomization />
    <button>create room</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PlayerCustomization from '../components/PlayerCustomization.vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    PlayerCustomization,
  },
  setup() {
    const { query } = useRoute();

    console.log(query);
  },
});
</script>

<style scoped></style>
