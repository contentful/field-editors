/* eslint-disable */
import baseConfig from '../../baseJestConfig.es.js';

import packageJson from './package.json' assert { type: 'json' };
const packageName = packageJson.name.split('@contentful/')[1];

export default {
  ...baseConfig(packageName),
};
