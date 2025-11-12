# @contentful/field-editors

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

This is the monorepo for all field editors and apps by [Contentful][contentful].

Since these are developed using the [App SDK][app-sdk], this will allow you to understand how each editor works, fork existing apps or create your own apps based on existing Contentful components' source rather than starting from scratch.

It uses [Typescript][typescript], [React][react], [Forma36][forma36] (a design system & component library by Contentful) and is managed using [Lerna][lerna]. It supports translations with [linguiJs][lingui]. Code is automatically formatted with [Prettier][prettier] and checked with [ESLint][eslint] on every commit using Git hooks.

## Available field editors

Playground with all components: [http://contentful-field-editors.colorfuldemo.com/](http://contentful-field-editors.colorfuldemo.com/)

This repository has all editorial components that you can find in the Contentful Web application.
You can run each of these component as a custom field app or compose them into a custom entry app.
You could also use these components as the basis for a custom [Contentful App](https://www.contentful.com/app-framework/)

- Single line editor
- Multi line editor
- Dropdown
- Tags
- List
- Checkbox
- Radio
- Boolean
- Rating
- Number
- Url
- JSON
- Location
- Date
- Markdown
- Slug
- Entry reference / Media
- Rich Text

Also this repository contains shared packages that simplify development and testing of field and entry apps.

Feel free to reach out to us with the ones that'd be the most useful to have
here by filing a [Github issue][github-issues]!

### Styles

To achieve the same field editor look as in the Contentful UI, you need to render `GlobalStyled` component.

```jsx
import { GlobalStyles } from '@contentful/f36-components';

function Root() {
  return (
    <>
      <GlobalStyles />
      <MyApp />
    </>
  );
}
```

## Getting started & contributing

### Requirements

- Node.js: `>=20`
- Yarn: `>=1.21.1`

To install all dependencies and build all packages run the following commands from the root of the project.

```
yarn
yarn build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get started.

We'd love to have your helping hand on `@contentful/field-editors`!

## Creating a canary release

Canary releases allow you to test changes before they are merged to the main branch.

### Steps

1. Create a pull request targeting the `canary` branch (instead of `master`)
2. Once the PR is merged to `canary`, CircleCI will automatically:
   - Build all packages
   - Run tests
   - Create a canary version (e.g., `1.2.3-canary.123.abc1234`)
   - Publish to npm with the `canary` tag
3. You can install the canary version in your project:
   ```bash
   yarn add @contentful/field-editor-reference@canaryversion
   ```

### Notes

- Canary releases are temporary and intended for testing only
- Each merge to the `canary` branch will create a new canary version
- Canary versions follow the format: `{version}-canary.{prNumber}.{shortSha}`

## Links & related repositories

- [App SDK][app-sdk]
- [Create Contentful App CLI][create-contentful-app]
- [Forma 36][forma36]

## Code of Conduct

We want to provide a safe, inclusive, welcoming, and harassment-free space and experience for all participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers.

[Read our full Code of Conduct](https://github.com/contentful-developer-relations/community-code-of-conduct).

## License

All field editor packages are open source software [licensed as MIT](./LICENSE).

[contentful]: https://www.contentful.com
[app-sdk]: https://github.com/contentful/ui-extensions-sdk
[create-contentful-app]: https://github.com/contentful/create-contentful-app
[github-issues]: https://github.com/contentful/field-editors/issues
[forma36]: https://github.com/contentful/forma-36
[typescript]: https://www.typescriptlang.org/
[react]: https://reactjs.org/
[lerna]: https://github.com/lerna/lerna
[prettier]: https://prettier.io/
[eslint]: https://eslint.org/
[lingui]: https://lingui.dev/

## Internationalization

The latest versions of field editors are internationalized with [lingui](https://lingui.dev/). Any app using the latest field editors needs to include the `@lingui/core` and `@lingui/message-utils` packages and initialize `lingui` like this before rendering field editors:

```javascript
import { i18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';

...

i18n.setMessagesCompiler(compileMessage);
i18n.activate('en-US');  // use desired locale code

const App = () => {
  ...
};
```
