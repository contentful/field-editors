const path = require('path');
const packagesConfig = require('../eslint.config.cjs');

module.exports = [
  ...packagesConfig,
  {
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.json'),
      },
    },
  },
];
