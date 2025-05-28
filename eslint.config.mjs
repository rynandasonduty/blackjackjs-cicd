import js from '@eslint/js';
import globals from 'globals';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist/**', 'build/**', '*.min.js', 'node_modules/**'],

    files: ['**/*.{js,mjs,cjs}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
        createjs: 'readonly',
      },
    },

    plugins: {
      jest: eslintPluginJest,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...eslintConfigPrettier.rules,

      'no-unused-vars': 'off',
      eqeqeq: 'warn',
      'no-console': 'off',
      curly: 'error',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'prefer-const': 'warn',
      'arrow-spacing': ['warn', { before: true, after: true }],
    },
  },
  {
    plugins: {
      jest: eslintPluginJest,
    },
    files: ['**/*.{test,spec}.{js,mjs,cjs}'],
    rules: {
      ...eslintPluginJest.configs.recommended.rules,
      ...eslintPluginJest.configs.style.rules,
    },
  },
]);
