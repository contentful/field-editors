import { defineConfig } from 'cypress';
import fs from 'fs';
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
  component: {
    setupNodeEvents(on, config) {
      on('task', task);
      on('after:spec', (_, results: CypressCommandLine.RunResult) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
          );
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video);
          }
        }
      });
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
              test: /\.t|jsx?$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'swc-loader',
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
  },
  video: true,
});
