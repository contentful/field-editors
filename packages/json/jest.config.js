/* eslint-disable */
const baseConfig = require('../../baseESMJestConfig.js');

const packageJSON = require('./package.json');
const packageName = packageJSON.name.split('@contentful/')[1];

export default {
  ...baseConfig(packageName),
};
