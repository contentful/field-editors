const webpack = require('@cypress/webpack-preprocessor');
const { initPlugin: initSnapshotPlugin } = require('cypress-plugin-snapshots/plugin');

module.exports = (on, config) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.js'],
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
            test: /\.ts$/,
            exclude: [/node_modules/],
            use: [
              {
                loader: 'ts-loader',
                options: {
                  configFile: 'cypress/tsconfig.json',
                },
              },
            ],
          },
        ],
      },
    },
  };
  on('file:preprocessor', webpack(options));

  initSnapshotPlugin(on, config);
  return config;
};
