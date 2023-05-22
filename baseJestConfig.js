/* eslint-disable */

function getConfig(packageName) {
  return {
    preset: 'ts-jest',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
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
    },
  };
}

module.exports = getConfig;
