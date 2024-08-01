module.exports = {
  extends: ['../.eslintrc.cjs', 'plugin:you-dont-need-lodash-underscore/compatible'],
  plugins: ['eslint-comments', 'you-dont-need-lodash-underscore'],
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
  overrides: [
    {
      files: '**/*.{spec,test}.{ts,tsx,js,jsx}',
      env: {
        node: true,
      },
      extends: ['plugin:jest/recommended', 'plugin:jsx-a11y/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'jest/expect-expect': 'off',
      },
    },
  ],
};
