import path from 'path';

const webpackFilename = path.join(__dirname, 'webpack.config.js');

export const plugin = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  if (config.testingType === 'component') {
    require('@cypress/react/plugins/load-webpack')(on, config, { webpackFilename });
  }

  return config;
};
