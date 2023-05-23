/* eslint-disable */

function getConfig(packageName) {
  return {
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleNameMapper: {
      '^lodash-es$': 'lodash',
    },
    reporters: [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: '../../reports',
          outputName: `${packageName}-results.xml`,
          addFileAttribute: true,
        },
      ],
    ],
    transform: {
      '^.+\\.(t|j)sx?$': '@swc/jest',
    },
  };
}

module.exports = getConfig;
