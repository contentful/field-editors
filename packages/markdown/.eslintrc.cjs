const path = require('path');

module.exports = {
  extends: '../.eslintrc.cjs',
  parserOptions: {
    project: path.resolve('tsconfig.json'),
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
