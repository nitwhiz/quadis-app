<template>
  <div class="header" :class="headerCls">
    <span class="brand">BLOCCS</span>
  </div>
  <div class="main">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  computed: {
    headerCls() {
      return ['home', 'room-join'].includes(this.$route.name as string)
        ? 'big'
        : 'small';
    },
  },
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito&family=Press+Start+2P&display=swap');

html,
body {
  margin: 0;
  padding: 0;

  width: 100%;
  height: 100%;

  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  font-family: 'Press Start 2P', monospace;
  color: #f1f1f1;

  background-color: #111111;

  .header {
    transition-property: all;
    transition-duration: 300ms;

    padding: 56px;

    font-size: 80px;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: #2c3e50;
    color: #f1f1f1;

    text-shadow: 10px 10px 0 black;

    border-bottom: 4px solid darken(#2c3e50, 25%);

    overflow: hidden;

    &.small {
      padding: 24px 32px;

      text-shadow: 3px 3px 0 black;

      font-size: 24px;
    }
  }

  .main {
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: #84909c;

    overflow: hidden;
  }
}
</style>
