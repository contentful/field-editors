# Contributing to Contentful Field Editors

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Getting started

### Requirements

- Node.js: `>=16.18.0`
- Yarn: `>=1.21.1`

To install all dependencies and build all packages run the following commands from the root of the project.

```
yarn
yarn build
```

You are ready to go! You can either develop your apps from `apps` folder or run a playground of all components in `development` mode.

## Submitting a Pull Request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please ask first if somebody else is already working on this or the Contentful developers think your feature is in-scope. Generally always have a related issue with discussions for whatever you are including.

## Folder structure

`@contenful/field-editors` is a monorepo, meaning it is divided into independent sub-packages.
These packages can be found in the `packages/` directory.

This monorepo is maintained using Lerna. Get started with Lerna by following [this link](https://github.com/lerna/lerna).

## Local development

### Using `docz`

We use [`storybook`](https://storybook.js.org//) as a components playground.

```bash
# to run playground in a development mode
yarn start
```

### Making changes in shared packages

Go to a shared package and run the following command to watch for changes and rebuild the package once it's changed:

```bash
cd packages/_shared
yarn watch
```

### Integration to Contentful web application

_Relevant for Contentful employees only_.

It is convenient to link a local copy of a package to a locally running Contentful web application without publishing a package.

```bash
yarn
yarn build
cd packages/single-line
# register a symplink
yarn link
# watch for changes in the package
yarn watch
```

In the web app repository:

```bash
# create a symlink to a local folder
yarn link '@contentful/field-editor-single-line'
```

## Adding packages

To add another package create a new directory in the `packages` folder. Since we are using Lerna all package scripts are available from the root by running `lerna run <script_name>`.

## Internationalization (i18n) setup

The project supports i18n thanks to the [Lingui library](https://lingui.dev/).

## Prerequisites & Naming conventions

To translate your strings, you need to make them identifiable with a translation key, represented by the `id`.

To ensure uniqueness, consistency, and descriptive keys, the keys follow a naming convention.

A custom [ESLint rule](./tools/eslint-rules/custom/enforce-translation-key-naming.js) is available to ensure the naming convention is followed, and that only supported projects prefixes are used.

## Adding translations

Depending on the structure and complexity of your strings, use the `t` function from `@lingui/core/macro` or the `Trans` react component from `@lingui/react`. Important: you have to add a default message to every new key added, in case the frontend application where a package is used, is not providing a translation catalog.

## Quality & Code Style

### Commit messages

All commit messages should meet the [conventional commit format](https://github.com/conventional-changelog/commitlint). The easiest way is to use `yarn cm` command which launches commit message wizard.

### Code formatting

You don't need to worry about formatting your code. It is automatically reformatted using `prettier` on every commit using Git hooks.

### Linting

We use [ESLint](https://eslint.org/) and [Typescript ESLint](https://github.com/typescript-eslint/typescript-eslint) for linting and checking code for errors.

All modern editors should automatically pick up configuration and show errors and warnings while you type.

#### Run ESLint for all packages

```bash
# at the monorepo root
yarn lint
```

### Checking types

#### Run Typescript checker for all packages

```bash
# at the monorepo root
yarn tsc
```

### Tests

We use [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/) for writing unit tests.

#### Run tests for concrete package

```bash
cd packages/single-line
yarn test
```

#### Run tests for all packages

```bash
# at the monorepo root
yarn test:ci
```

#### Accessibility tests

We use [`vitest-axe`](https://github.com/nicholasgasior/vitest-axe) for automated accessibility checks. The `toHaveNoViolations` matcher is globally available — no import needed.

Every component needs axe coverage across its meaningful states. A single test on the default render is not sufficient: a component that passes in its default state can still have violations when disabled, in an error state, or with different content rendered. Cover each state where the DOM structure or ARIA attributes change.

```tsx
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';

import { SingleLineEditor } from './SingleLineEditor';

describe('SingleLineEditor accessibility', () => {
  it('has no violations in default state', async () => {
    const [field] = createFakeFieldAPI((f) => ({ ...f, type: 'Symbol' }));
    const { container } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const [field] = createFakeFieldAPI((f) => ({ ...f, type: 'Symbol' }));
    const { container } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={true}
        locales={createFakeLocalesAPI()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a validation error', async () => {
    const [field, mitt] = createFakeFieldAPI((f) => ({ ...f, type: 'Symbol' }));
    const { container } = render(
      <SingleLineEditor
        field={field}
        isInitiallyDisabled={false}
        locales={createFakeLocalesAPI()}
      />,
    );
    // trigger an error state before asserting
    act(() => mitt.emit('schemaErrors', [{ message: 'Required' }]));
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

What to cover per component:

- **Default / empty** — baseline render with no value
- **Filled** — rendered with actual content (especially relevant for rich text or media editors where content changes the DOM)
- **Disabled** — `isInitiallyDisabled={true}`
- **Error / validation state** — after schema errors are emitted
- Any state that adds or removes interactive elements (e.g. dialogs, popovers, expanded panels)

#### Links

- [`@testing-library/react` documentation](https://testing-library.com/docs/react-testing-library/intro)
- [`vitest` documentation](https://vitest.dev/guide/)
- [`vitest-axe` documentation](https://github.com/nicholasgasior/vitest-axe)
