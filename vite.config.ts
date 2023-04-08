import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import strip from '@rollup/plugin-strip';
import eslintPlugin from 'vite-plugin-eslint';
import * as child from 'child_process';
import { name, version } from './package.json';

const commitHash = child
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trimEnd();
const buildVersion = `${name} v${version}+git.${commitHash}`;

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
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },
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
