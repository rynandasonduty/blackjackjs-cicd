import js from '@eslint/js';
import globals from 'globals';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      '*.min.js',
      'node_modules/**',
      'js/create.js',
      '**/create.js',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // Global variables untuk BlackJack game
        messages: 'writable',
        imgs: 'writable',
        createjs: 'readonly',
        // Tambahan globals yang mungkin diperlukan
        stage: 'writable',
        canvas: 'writable',
        game: 'writable',
        player: 'writable',
        dealer: 'writable',
        deck: 'writable',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      jest: eslintPluginJest,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...eslintConfigPrettier.rules,

      // Relaxed rules untuk development
      'no-unused-vars': 'off',
      'no-undef': 'error',
      eqeqeq: 'warn',
      'no-console': 'off',
      curly: 'error',
      'no-multiple-empty-lines': ['warn', { max: 2 }],
      'prefer-const': 'warn',
      'arrow-spacing': ['warn', { before: true, after: true }],
      'no-var': 'warn',
      semi: ['warn', 'always'],
      quotes: ['warn', 'single'],
      indent: ['warn', 2],
      'no-trailing-spaces': 'warn',
      'brace-style': ['warn', '1tbs'],
      'keyword-spacing': 'warn',
      'space-before-blocks': 'warn',
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
    },
  },
  {
    files: ['**/*.{test,spec}.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    plugins: {
      jest: eslintPluginJest,
    },
    rules: {
      ...eslintPluginJest.configs.recommended.rules,
      ...eslintPluginJest.configs.style.rules,
    },
  },
];
