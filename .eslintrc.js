module.exports = {
  extends: [
    require.resolve('@contentful/eslint-config-extension'),
    require.resolve('@contentful/eslint-config-extension/react.js'),
    require.resolve('@contentful/eslint-config-extension/typescript.js'),
  ],
  plugins: ['eslint-plugin-import-helpers', 'eslint-plugin-import'],
  rules: {
    'import/extensions': ['error', 'always'],
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: ['/^react/', 'module', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', ignoreCase: true },
      },
    ],
    'import/extensions': ['error', 'ignorePackages'],
  },
};
