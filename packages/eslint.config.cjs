const rootConfig = require('../eslint.config.cjs');
const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...rootConfig,
  // Temporarily disabled to debug
  // ...compat.extends('plugin:you-dont-need-lodash-underscore/compatible'),
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      'eslint-comments': require('eslint-plugin-eslint-comments'),
    },
    rules: {
      // Require descriptions only for disable-line and disable-next-line
      'eslint-comments/require-description': [
        'error',
        {
          ignore: [
            'eslint',
            'eslint-disable',
            'eslint-enable',
            'eslint-env',
            'exported',
            'global',
            'globals',
          ],
        },
      ],
      'react/default-props-match-prop-types': 'warn',
      'react/no-unused-prop-types': 'off',
      'you-dont-need-lodash-underscore/flatten': 'warn',
      'you-dont-need-lodash-underscore/throttle': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': true,
        },
      ],
    },
  },
  // Temporarily disabled to debug
  // ...compat.extends('plugin:jest/recommended', 'plugin:jsx-a11y/recommended').map((config) => ({
  //   ...config,
  //   files: ['**/*.{spec,test}.{ts,tsx,js,jsx}'],
  // })),
  {
    files: ['**/*.{spec,test}.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'jest/expect-expect': 'off',
    },
  },
];
