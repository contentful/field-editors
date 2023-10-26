/* eslint-disable */

const baseConfig = require('../../baseJestConfig');

const package = require('./package.json');
const packageName = package.name.split('@contentful/')[1];

module.exports = {
  ...baseConfig(packageName),
  transformIgnorePatterns: [`<rootDir>/../../node_modules/(?!nanoid|rehype-raw)`],
  moduleNameMapper: {
    ...baseConfig(packageName).moduleNameMapper,
    '^.+\\.css$': '<rootDir>/src/__mocks__/styles.ts',
    'react-markdown': '<rootDir>/../../node_modules/react-markdown/react-markdown.min.js',
  },
};
