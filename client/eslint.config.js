import htmlPlugin from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Правила и структура взяты из E:\Code\Easy English\client\eslint.config.js (Expo заменён на Vite + typescript-eslint). */
export default tseslint.config([
  globalIgnores(['dist', 'eslint.config.js']),
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    ...importPlugin.flatConfigs.recommended,
  },
  {
    files: ['*.{js,mjs,cjs}', '**/*.{js,mjs,cjs}'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@html-eslint': htmlPlugin,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      '@html-eslint/no-multiple-empty-lines': ['error', { max: 0 }],
      '@html-eslint/no-trailing-spaces': 'error',
      '@html-eslint/require-doctype': 'error',
      '@html-eslint/require-lang': 'error',
      'eol-last': ['error', 'always'],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      react: reactPlugin,
      promise: promisePlugin,
      '@stylistic': stylistic,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
      },
    },
    rules: {
      // Максимальная длина строки в коде.
      'max-len': ['error', { code: 150, ignoreUrls: true, ignoreStrings: true }],
      // Отступы в коде.
      indent: ['error', 2],
      // Отступы в JSX-коде.
      'react/jsx-indent': ['error', 2, { checkAttributes: true, indentLogicalExpressions: true }],
      // Отступы в пропсах компонентов.
      'react/jsx-indent-props': ['error', 2],
      // Управляет пробелами в JSX-тегах, в т.ч. перед "/>".
      'react/jsx-tag-spacing': ['error', {
        beforeSelfClosing: 'never',
        closingSlash: 'never',
        beforeClosing: 'never',
        afterOpening: 'never',
      }],
      // Запятая после последнего элемента в многострочных объектах и массивах
      'comma-dangle': ['error', 'always-multiline'],
      // Запрещает наличие нескольких пробелов подряд в коде.
      'no-multi-spaces': ['error'],
      // Запрещает множественные пробелы между атрибутами JSX.
      'react/jsx-props-no-multi-spaces': ['error'],
      // Удаляет лишние пробелы в конце строк.
      'no-trailing-spaces': ['error', { skipBlankLines: false, ignoreComments: false }],
      // Удаляет лишние пробелы вокруг запятых.
      'comma-spacing': ['error'],
      // Запрещает использование отрицательных условий.
      'no-negated-condition': ['error'],
      // Запрещает использование вложенных тернарных выражений.
      'no-nested-ternary': ['error'],
      // Запрещает наличие пробелов перед точкой при обращении к свойствам объектов.
      'no-whitespace-before-property': ['error'],
      // Пробел после if / for / while / switch / catch и т.д. перед ( или следующим токеном.
      'keyword-spacing': ['error', { before: true, after: true }],
      // Требует пробелы вокруг инфиксных операторов, включая присваивание (=).
      'space-infix-ops': ['error'],
      // Не больше 3 пустых строк подряд; в начале/конце файла — без лишних пропусков.
      'no-multiple-empty-lines': ['error', { max: 3, maxEOF: 1, maxBOF: 0 }],

      // === Настройки плагина eslint-plugin-import ===
      // Разрешение алиасов (#src) оставляем TypeScript; иначе нужен resolver с жёсткими peer-deps.
      'import/no-unresolved': 'off',
      'import/newline-after-import': ['warn', { count: 1 }],
      'import/no-duplicates': ['error'],
      'import/first': ['warn'],
      'import/no-mutable-exports': ['error'],

      // Запрещает использование методов console, за исключением warn и error.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Добавляет пробелы внутри квадратных скобок массивов.
      'array-bracket-spacing': ['error', 'always'],
      // Добавляет пробелы внутри фигурных скобок объектов.
      'object-curly-spacing': ['error', 'always'],
      'no-var': ['error'],
      'no-tabs': ['error'],
      'prefer-const': ['error', { destructuring: 'all', ignoreReadBeforeAssign: false }],
      quotes: ['error', 'single'],
      'jsx-quotes': ['error', 'prefer-single'],
      // Убирает лишние фигурные скобки у строк в JSX-пропсах: prop='value' вместо prop={'value'}.
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore', propElementValues: 'always' }],

      'max-depth': ['error', { max: 5 }],
      'max-params': ['error', { max: 5 }],
      'max-nested-callbacks': ['error', { max: 5 }],

      'promise/no-nesting': ['error'],
      'promise/valid-params': ['error'],
      'promise/catch-or-return': [
        'error',
        {
          allowFinally: true,
          terminationMethod: ['catch', 'asCallback'],
        },
      ],
      'promise/no-promise-in-callback': ['error'],
      'promise/no-callback-in-promise': ['off'],
      'promise/no-return-in-finally': ['error'],

      '@typescript-eslint/no-var-requires': ['error'],
      '@typescript-eslint/no-explicit-any': ['error'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],

      'react/jsx-max-depth': ['error', { max: 5 }],
    },
  },
]);
