const webpack = require('@cypress/webpack-preprocessor');

const fs = require('fs');

module.exports = (on) => {
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

  on('task', {
    readFileMaybe(filename) {
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, 'utf8');
      }

      return null;
    },
  });
};
