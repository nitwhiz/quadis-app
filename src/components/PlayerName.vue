<template>
  <div class="player-name">
    <div class="headline">ENTER PLAYER NAME</div>
    <input v-model="playerName" type="text" maxlength="8" />
    <a class="confirm" href="javascript:void(0);" @click="doConfirm">{{
      buttonText
    }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import usePlayerName from '../composables/usePlayerName';

export default defineComponent({
  props: {
    isJoin: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['confirm'],
  setup() {
    const { confirm, playerName } = usePlayerName();

    return {
      playerName,
      confirm,
    };
  },
  computed: {
    buttonText() {
      return this.isJoin ? 'JOIN ROOM' : 'CREATE ROOM';
    },
  },
  methods: {
    doConfirm() {
      this.confirm();
      this.$emit('confirm');
    },
  },
});
</script>

<style lang="scss" scoped>
.player-name {
  display: flex;
  flex-direction: column;
  align-items: center;

  .headline {
    font-size: 28px;
  }

  input {
    border: 0;
    outline: 0;

    background: #333;
    font-family: 'Press Start 2P', monospace;
    font-size: 20px;
    color: white;
    text-align: center;
    text-transform: uppercase;

    border-bottom: 2px solid #555;
    width: 75%;

    margin: 20px 0;
    padding: 12px 16px;
  }

  a.confirm {
    color: #f1f1f1;
    text-decoration: none;
    border: 1px solid #f1f1f1;
    padding: 12px 18px;
    font-size: 18px;
    background-color: #222;
  }
}
</style>
