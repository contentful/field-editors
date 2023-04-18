import { defineConfig } from 'cypress';

// @ts-expect-error -- no types
import webpackConfig from './webpack.config.js';

const task = {
  log(message: string) {
    //eslint-disable-next-line no-console
    console.log(message);

    return null;
  },
  table(message: string) {
    //eslint-disable-next-line no-console
    console.table(message);

    return null;
  },
};

export default defineConfig({
  retries: {
    runMode: 2,
    openMode: 0,
  },
  numTestsKeptInMemory: 1,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(_on, config) {
      return config;
    },
    baseUrl: 'http://localhost:9000',
    specPattern: 'cypress/e2e/**/*.spec.*',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
  },
  component: {
    setupNodeEvents(on, config) {
      on('task', task);
      return config;
    },
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig,
    },
    specPattern: 'cypress/component/**/*.spec.{js,ts,jsx,tsx}',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
  },
});
