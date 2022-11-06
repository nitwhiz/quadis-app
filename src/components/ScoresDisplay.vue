<script setup lang="ts">
import { computed, PropType } from 'vue';
import Score from '../quadis/score/Score';

const props = defineProps({
  scores: {
    type: Array as PropType<
      { gameId: string; playerName: string; score: Score }[]
    >,
    required: true,
  },
});

defineEmits(['close']);

const sortedScores = computed(() =>
  [...props.scores].sort((a, b) => {
    return b.score.score - a.score.score;
  }),
);
</script>

<template>
  <div class="scores-display">
    <h1>SCORES</h1>
    <div class="scores-wrapper">
      <div class="entry header">
        <div class="rank">
          <span>RANK</span>
        </div>
        <div class="name">
          <span>NAME</span>
        </div>
        <div class="score">
          <span>SCORE </span>
        </div>
        <div class="lines">
          <span>LINES</span>
        </div>
      </div>
      <div v-for="(entry, i) of sortedScores" :key="entry.gameId" class="entry">
        <div class="rank">
          <span>{{ i + 1 }}.</span>
        </div>
        <div class="name">
          <span>{{ entry.playerName }}</span>
        </div>
        <div class="score">
          <span>{{ entry.score.score }}</span>
        </div>
        <div class="lines">
          <span>{{ entry.score.lines }}</span>
        </div>
      </div>
    </div>
    <button @click="() => $emit('close')">CLOSE</button>
  </div>
</template>

<style lang="scss" scoped>
.scores-display {
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  z-index: 30;

  background-color: black;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .scores-wrapper {
    border: 1px solid rgba(255, 255, 255, 0.075);

    overflow: hidden;

    width: 100%;
    max-width: 800px;

    .entry {
      display: flex;

      font-size: 12px;
      line-height: 24px;

      padding: 8px 14px;

      &:nth-child(odd) {
        background-color: rgba(255, 255, 255, 0.1);
      }

      & > div {
        display: flex;
        align-items: center;

        text-overflow: ellipsis;

        flex-shrink: 0;
      }

      &.header > div {
        text-decoration: underline;
      }

      .rank {
        justify-content: flex-end;

        width: 48px;
        margin-right: 8px;
      }

      .name {
        flex: 1;
      }

      .score {
        width: 120px;
      }

      .lines {
        width: 72px;
      }

      .score,
      .lines {
        justify-content: flex-end;
      }
    }
  }

  button {
    margin-top: 20px;
  }
}
</style>
