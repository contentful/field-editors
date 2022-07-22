module.exports = {
  extends: ['../.eslintrc.js', 'plugin:mocha/recommended', 'plugin:cypress/recommended'],
  plugins: ['cypress'],
  rules: {
    'cypress/no-unnecessary-waiting': 'warn',
    'mocha/no-mocha-arrows': 'off',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-skipped-tests': 'error',
    '@typescript-eslint/no-var-requires': 'off',
  },
  env: {
    'cypress/globals': true,
  },
  globals: {
    require: true,
  },
};
