import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
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

const fsdElements = [
  { type: 'app', pattern: 'src/app/**' },
  { type: 'pages', pattern: 'src/pages/**' },
  { type: 'widgets', pattern: 'src/widgets/**' },
  { type: 'features', pattern: 'src/features/**' },
  { type: 'entities', pattern: 'src/entities/**' },
  { type: 'shared', pattern: 'src/shared/**' },
  {
    type: 'legacy',
    pattern:
      'src/{components,lib,types,hooks,i18n,theme,auth,layouts,store,schemas}/**',
  },
];

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
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': fsdElements,
      'boundaries/include': ['src/**/*'],
    },
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'boundaries/dependencies': [
        'warn',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { types: 'shared' } },
              disallow: {
                to: {
                  element: {
                    types: {
                      anyOf: [
                        'app',
                        'pages',
                        'widgets',
                        'features',
                        'entities',
                        'legacy',
                      ],
                    },
                  },
                },
              },
            },
            {
              from: { element: { types: 'entities' } },
              disallow: {
                to: {
                  element: {
                    types: {
                      anyOf: [
                        'app',
                        'pages',
                        'widgets',
                        'features',
                        'entities',
                        'legacy',
                      ],
                    },
                  },
                },
              },
            },
            {
              from: { element: { types: 'features' } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ['app', 'pages', 'widgets', 'features'] },
                  },
                },
              },
            },
            {
              from: { element: { types: 'widgets' } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ['app', 'pages', 'widgets'] },
                  },
                },
              },
            },
            {
              from: { element: { types: 'pages' } },
              disallow: {
                to: {
                  element: { types: { anyOf: ['app', 'pages'] } },
                },
              },
            },
            {
              from: { element: { types: 'app' } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ['widgets', 'features', 'entities'] },
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/features/**/*.{ts,tsx}',
      'src/entities/**/*.{ts,tsx}',
      'src/pages/**/*.{ts,tsx}',
      'src/widgets/**/*.{ts,tsx}',
      'src/auth/**/*.{ts,tsx}',
      'src/shared/hooks/**/*.{ts,tsx}',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: [
      'src/shared/ui/**/*.{ts,tsx}',
      'src/theme/**/*.{ts,tsx}',
      'src/i18n/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/layouts/**/*.{ts,tsx}',
      'src/app/router/**/*.{ts,tsx}',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
