/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const webpack = require('webpack');

// eslint-disable-next-line no-undef
module.exports = {
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
            loader: 'ts-loader',
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
};
