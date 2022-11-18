import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig(() => ({
  plugins: [vue(), eslintPlugin()],
  server: {
    host: '0.0.0.0',
    hmr: true,
  },
  esbuild: {
    platform: 'browser',
  },
  build: {
    target: ['es2020'],
    cssCodeSplit: false,
    rollupOptions: {
      manualChunks: (id: string) => {
        if (id.includes('node_modules')) {
          let name = 'vendor';

          if (id.includes('@pixi')) {
            name += '.pixi';
          } else if (id.includes('vue')) {
            name += '.vue';
          }

          return name;
        }

        return 'index';
      },
    },
  },
  test: {
    clearMocks: true,
  },
}));
