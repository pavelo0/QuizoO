import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

/** Абсолютный корень пакета `frontend` — обязателен в монорепо, иначе парсер видит и frontend, и backend tsconfig. */
const tsconfigRootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
);

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '**/*.gen.ts', 'build']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
