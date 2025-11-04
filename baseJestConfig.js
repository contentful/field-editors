/* eslint-disable */

function getConfig(packageName) {
  return {
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
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
    transformIgnorePatterns: [`/node_modules/(?!nanoid)`],
    moduleNameMapper: {
      '^@contentful/field-editor-shared$': '<rootDir>/../../packages/_shared/src',
      '^@contentful/field-editor-test-utils$': '<rootDir>/../../packages/_test/src',
    },
  };
}

module.exports = getConfig;
