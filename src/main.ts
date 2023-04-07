import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { BaseTexture, SCALE_MODES } from '@pixi/core';

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

createApp(App).use(router).mount('#app');
