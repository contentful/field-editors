const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Ports packages/.eslintrc.js, applied to every package (mirrors its `extends`/`plugins`/`rules`).
const packagesConfig = compat
  .config({
    extends: ['plugin:you-dont-need-lodash-underscore/compatible'],
    plugins: ['eslint-comments', 'you-dont-need-lodash-underscore'],
    rules: {
      'eslint-comments/require-description': [
        'error',
        {
          ignore: [
            'eslint',
            'eslint-disable',
            'eslint-enable',
            'eslint-env',
            'exported',
            'global',
            'globals',
          ],
        },
      ],
      'react/default-props-match-prop-types': 'warn',
      'react/no-unused-prop-types': 'off',
      'you-dont-need-lodash-underscore/flatten': 'warn',
      'you-dont-need-lodash-underscore/throttle': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': true,
        },
      ],
    },
  })
  .map((config) => ({ ...config, files: ['packages/**'] }));

// Ports packages/.eslintrc.js's test-file override.
const packagesTestConfig = compat
  .config({
    extends: ['plugin:@vitest/legacy-recommended', 'plugin:jsx-a11y/recommended'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@vitest/expect-expect': 'off',
      '@vitest/valid-title': 'off',
    },
  })
  .map((config) => ({ ...config, files: ['packages/**/*.{spec,test}.{ts,tsx,js,jsx}'] }));

// Ports packages/rich-text/.eslintrc.js.
const richTextConfig = compat
  .config({
    env: { node: true },
    rules: {
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }],
      'you-dont-need-lodash-underscore/omit': 'off',
    },
  })
  .map((config) => ({ ...config, files: ['packages/rich-text/**'] }));

// Ports cypress/.eslintrc.js.
const cypressConfig = compat
  .config({
    extends: ['plugin:mocha/recommended', 'plugin:cypress/recommended'],
    plugins: ['cypress'],
    env: { 'cypress/globals': true },
    rules: {
      'cypress/no-unnecessary-waiting': 'warn',
      'mocha/no-mocha-arrows': 'off',
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-skipped-tests': 'error',
      '@typescript-eslint/no-var-requires': 'off',
    },
  })
  .map((config) => ({ ...config, files: ['cypress/**'] }));

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.docz/**',
      '.coverage/**',
      '.cache/**',
      '**/dist/**',
      '**/build/**',
      'cypress/plugins/**',
      'cypress/support/**',
      '**/.eslintrc.js',
      '**/snapshots.js',
    ],
  },
  ...compat.config(require('./.eslintrc.js')),
  ...packagesConfig,
  ...packagesTestConfig,
  // Each packages/*/.eslintrc.js exists only to set parserOptions.project to its own
  // tsconfig.json; `project: true` auto-discovers the nearest tsconfig instead.
  {
    files: ['packages/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  // Story files aren't included in any package's tsconfig.json, so typed linting can't run on them.
  {
    ...tsPlugin.configs['flat/disable-type-checked'],
    files: ['packages/**/stories/**/*.{ts,tsx}'],
  },
  // packages/markdown/.eslintrc.js
  {
    files: ['packages/markdown/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  ...richTextConfig,
  ...cypressConfig,
];
