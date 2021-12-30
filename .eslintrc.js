const jsExtensions = ['.js', '.jsx'];
const tsExtensions = ['.ts', '.tsx', '.d.ts'];
const allExtensions = jsExtensions.concat(tsExtensions);

module.exports = {
  extends: [require.resolve('@contentful/eslint-config-extension')],
  extends: ['plugin:import/recommended'],
  plugins: ['eslint-plugin-import-helpers'],
  settings: {
    'import/extensions': allExtensions,
    'import/parsers': {
      '@typescript-eslint/parser': tsExtensions,
    },
    'import/resolver': {
      node: {
        extensions: allExtensions,
      },
    },
  },
  rules: {
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: ['/^react/', 'module', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', ignoreCase: true },
      },
    ],
  },
};
