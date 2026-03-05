const rootConfig = require('../eslint.config.cjs');
const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...rootConfig,
  ...compat.extends('plugin:mocha/recommended', 'plugin:cypress/recommended'),
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        require: true,
      },
    },
    rules: {
      'cypress/no-unnecessary-waiting': 'warn',
      'mocha/no-mocha-arrows': 'off',
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-skipped-tests': 'error',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
