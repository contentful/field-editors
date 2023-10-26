/* eslint-disable */

function getConfig(packageName) {
  return {
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
      '^(\\.\\.?\\/.+)\\.js$': '$1',
    },
    transform: {
      '^.+\\.tsx?$': ['@swc/jest'],
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
  };
}

module.exports = getConfig;
