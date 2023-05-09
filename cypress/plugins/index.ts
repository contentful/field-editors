import webpack from '@cypress/webpack-preprocessor';
import { register } from '@cypress/snapshot';
import path from 'path';

const webpackFilename = path.join(__dirname, 'webpack.config.js');

export const plugin = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  if (config.testingType === 'e2e') {
    on('file:preprocessor', webpack({ webpackOptions: require(webpackFilename) }));

    register();
  }

  if (config.testingType === 'component') {
    require('@cypress/react/plugins/load-webpack')(on, config, { webpackFilename });
  }

  return config;
};
