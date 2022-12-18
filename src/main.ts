import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { SCALE_MODES, settings } from '@pixi/core';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

createApp(App).use(router).mount('#app');
