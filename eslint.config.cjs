const js = require('@eslint/js');
const globals = require('globals');
const { FlatCompat } = require('@eslint/eslintrc');
const tseslint = require('typescript-eslint');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: [
      '**/node_modules/',
      '**/.docz/',
      '**/.coverage/',
      '**/.cache/',
      '**/dist/',
      '**/build/',
      '**/cypress/plugins/',
      '**/cypress/support/',
      '**/snapshots.js',
      '**/eslint.config.cjs',
      'apps/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('plugin:react/recommended', 'plugin:react-hooks/recommended'),
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-helpers': require('eslint-plugin-import-helpers'),
      'custom-lingui': require('./tools/eslint-plugin-custom-lingui'),
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off', // Disabled due to crashes with TypeScript ESLint 8.x
      'react-hooks/exhaustive-deps': 'error',
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: ['/^react/', 'module', ['parent', 'sibling', 'index']],
          alphabetize: { order: 'asc', ignoreCase: true },
        },
      ],
      'no-restricted-imports': ['warn'],
      'react/react-in-jsx-scope': 'off',
      'no-console': 'warn',
      'custom-lingui/enforce-translation-call-format': 'error',
      'custom-lingui/enforce-translation-key-naming': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
