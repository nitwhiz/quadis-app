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
  rules: {
    'no-console': 2,
  },
  overrides: [
    {
      files: ['test/**/*.spec.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
