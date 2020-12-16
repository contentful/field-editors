const path = require('path');

module.exports = {
  extends: [
    require.resolve('@contentful/eslint-config-extension/typescript'),
    require.resolve('@contentful/eslint-config-extension/jsx-a11y'),
    require.resolve('@contentful/eslint-config-extension/react'),
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
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
        browser: true,
        node: true,
      },
      extends: [require.resolve('@contentful/eslint-config-extension/jest')],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'jest/expect-expect': 'off',
      },
    },
  ],
};
