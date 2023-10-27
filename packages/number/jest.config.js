import baseConfig from '../../baseESMJestConfig.js';
import packageJSON from './package.json' assert { type: 'json' };

const packageName = packageJSON.name.split('@contentful/')[1];

export default {
  ...baseConfig(packageName),
};
