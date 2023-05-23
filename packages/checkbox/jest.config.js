/* eslint-disable */

const baseConfig = require('../../baseJestConfig');

const package = require('./package.json');
const packageName = package.name.split('@contentful/')[1];

module.exports = {
  ...baseConfig(packageName),
  transformIgnorePatterns: [`/node_modules/(?!nanoid)`],
};
