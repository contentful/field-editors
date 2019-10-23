# @contentful/field-editor-shared

This package contains shared code (components, utilities, test utilities) that is used by all other field editor packages.

## Commands

Uses [`tsdx`](https://github.com/palmerhq/tsdx) - a zero-config CLI that helps you develop, test, and publish modern TypeScript packages with ease.

### `yarn watch`

Runs the project in development/watch mode. Your library will be rebuilt if you make edits.

### `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

For more information check [`tsdx` documentation](https://github.com/palmerhq/tsdx) out.
