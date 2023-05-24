import { defineConfig } from 'cypress';
import webpack from 'webpack';

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
      webpackConfig: {
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
        },
        // needed to prevent ReferenceErrors
        // cf. https://github.com/webpack/webpack/issues/6693#issuecomment-745688108
        output: {
          hotUpdateChunkFilename: '[id].[fullhash].hot-update.js',
          hotUpdateMainFilename: '[runtime].[fullhash].hot-update.json',
        },
        performance: false,
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'swc-loader',
                  options: {
                    configFile: 'cypress/tsconfig.json',
                    transpileOnly: true,
                  },
                },
              ],
            },
            {
              test: /\.mjs$/,
              type: 'javascript/auto',
            },
          ],
        },
        plugins: [
          new webpack.ProvidePlugin({
            process: 'process/browser.js',
          }),
        ],
      },
    },
    specPattern: 'cypress/component/**/*.spec.{js,ts,jsx,tsx}',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
  },
});
