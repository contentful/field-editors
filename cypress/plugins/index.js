const webpack = require('@cypress/webpack-preprocessor');

module.exports = on => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.js']
      },
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
