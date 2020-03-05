module.exports = {
  extends: '../.eslintrc.js',
  plugins: ['cypress'],
  env: {
    'cypress/globals': true
  },
  globals: {
    require: true
  }
};
