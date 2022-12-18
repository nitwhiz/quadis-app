<script setup lang="ts">
import { onMounted } from 'vue';
import GameHost from '../quadis/game/GameHost';
import { Assets } from '@pixi/assets';
import { PieceContainer } from '../quadis/piece/PieceContainer';
import { Texture } from '@pixi/core';

const blockTextureUrl = new URL(`../assets/block.png`, import.meta.url).href;
const blockTexture = (await Assets.load(blockTextureUrl)) as Texture;

PieceContainer.bakePieceSprites(blockTexture);

onMounted(() => {
  GameHost.getInstance().injectApp();
});
</script>

<template>
  <div class="main">
    <router-view />
  </div>
</template>
