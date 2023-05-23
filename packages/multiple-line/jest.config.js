/* eslint-disable */

const baseConfig = require('../../baseJestConfig');

const package = require('./package.json');
const packageName = package.name.split('@contentful/')[1];

console.log({ ex: baseConfig('kuda') });
module.exports = {
  ...baseConfig(packageName),
};
