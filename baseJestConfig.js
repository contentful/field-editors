/* eslint-disable */

function getConfig(packageName) {
  return {
    preset: 'ts-jest',
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
      '^.+\\.spec.{ts|tsx}?$': [
        'ts-jest',
        {
          diagnostics: false,
        },
      ],
      '^.+\\.js$': 'babel-jest',
    },
  };
}

module.exports = getConfig;
