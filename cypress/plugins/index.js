const webpack = require('@cypress/webpack-preprocessor');
const { initPlugin: initSnapshotPlugin } = require('cypress-plugin-snapshots/plugin');
const path = require('path');

const webpackFilename = path.join(__dirname, 'webpack.config.js');

module.exports = (on, config) => {
  if (config.testingType === 'e2e') {
    on('file:preprocessor', webpack({ webpackOptions: require(webpackFilename) }));

    initSnapshotPlugin(on, config);
  }

  if (config.testingType === 'component') {
    require('@cypress/react/plugins/load-webpack')(on, config, { webpackFilename });
  }

  return config;
};
