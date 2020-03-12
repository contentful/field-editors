const webpack = require('@cypress/webpack-preprocessor');

module.exports = on => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.js']
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
                  configFile: 'cypress/tsconfig.json'
                }
              }
            ]
          }
        ]
      }
    }
  };
  on('file:preprocessor', webpack(options));
};
