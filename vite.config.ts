import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig(({ mode }) => ({
  plugins: [vue(), eslintPlugin()],
  server: {
    host: '0.0.0.0',
    hmr: false,
  },
  esbuild:
    mode === 'production'
      ? {
          drop: ['console', 'debugger'],
          platform: 'browser',
        }
      : {},
}));
