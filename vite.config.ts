import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import strip from '@rollup/plugin-strip';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig((env) => ({
  plugins: [
    env.mode === 'production'
      ? (strip({
          include: ['src/**/*.ts'],
          functions: ['DevDataCollector.*', '*Logger.debug', '*Logger.info'],
        }) as Plugin)
      : undefined,
    vue(),
    eslintPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    hmr: false,
  },
  esbuild: {
    platform: 'browser',
  },
  build: {
    target: ['es2020'],
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/quadis.main.[hash].js',
        manualChunks: (id: string) => {
          let name = 'quadis';

          if (id.includes('node_modules')) {
            name += '.vendor';

            if (id.includes('@pixi')) {
              name += '.pixi';
            } else if (id.includes('vue')) {
              name += '.vue';
            }
          }

          return name;
        },
      },
    },
  },
  test: {
    clearMocks: true,
  },
}));
