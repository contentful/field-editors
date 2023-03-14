/* eslint-disable */

function getConfig(packageName) {
  return {
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
    globals: {
      'ts-jest': {
        diagnostics: false,
      },
    },
  };
}

module.exports = getConfig;
