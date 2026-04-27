import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Стиль без Prettier: правила @stylistic + ESLint.
 * - Переносы строк в цепочках `.a().b()` не навязываются (нет printWidth).
 * - Массивы: `@stylistic/array-bracket-spacing` → `[ elem ]`.
 * - Поля с декораторами: `@stylistic/indent` с `ignoredNodes`, чтобы не ломать выравнивание `@` и имени поля.
 */
export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  {
    files: ['*.{js,mjs,cjs}', '**/*.{js,mjs,cjs}'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
      promise: promisePlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      /** `[ a, b ]` и `[ x ]`; `objectsInArrays` — без лишнего пробела перед `{` в `[{ ... }]` */
      '@stylistic/array-bracket-spacing': [
        'error',
        'always',
        { objectsInArrays: false, arraysInArrays: false },
      ],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      /**
       * Раньше для PropertyDefinition с декораторами использовали ignoredNodes — из‑за этого
       * `eslint --fix` не выравнивал поля. У @stylistic/indent для полей с декораторами отдельная
       * логика (имя свойства не сдвигается лишним уровнем относительно `@`).
       */
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
      '@stylistic/max-len': [
        'error',
        { code: 150, ignoreUrls: true, ignoreStrings: true, ignoreRegExpLiterals: true },
      ],
      '@stylistic/no-multi-spaces': ['error'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 3, maxEOF: 1, maxBOF: 0 }],
      '@stylistic/no-trailing-spaces': ['error', { skipBlankLines: false, ignoreComments: false }],
      '@stylistic/no-whitespace-before-property': ['error'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-infix-ops': 'error',

      'import/no-unresolved': 'off',
      'import/newline-after-import': ['warn', { count: 1 }],
      'import/no-duplicates': ['error'],
      'import/first': ['warn'],
      'import/no-mutable-exports': ['error'],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': ['error'],
      'prefer-const': ['error', { destructuring: 'all', ignoreReadBeforeAssign: false }],
      'no-negated-condition': ['error'],
      'no-nested-ternary': ['error'],

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
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
    },
  },
);
