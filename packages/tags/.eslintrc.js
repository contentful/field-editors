const path = require('path');

module.exports = {
  extends: '../.eslintrc.js',
  parserOptions: {
    project: path.resolve('tsconfig.json')
  }
};
