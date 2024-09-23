const path = require('path');

module.exports = {
  extends: '../.eslintrc.js',
  env: {
    node: true,
  },
  parserOptions: {
    project: path.resolve('tsconfig.json'),
  },
  rules: {
    'jest/valid-title': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }],
    'you-dont-need-lodash-underscore/omit': 0, // Can't use destructuring assignment because of unused var rule.
  },
};
