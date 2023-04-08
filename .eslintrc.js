module.exports = {
  env: {
    node: true,
    browser: true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'prettier',
  ],
  globals: {
    __BUILD_VERSION__: true,
  },
  rules: {
    'no-console': 2,
  },
  overrides: [
    {
      files: ['test/**/*.spec.ts', 'vite.config.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
