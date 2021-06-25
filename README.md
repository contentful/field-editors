# @contentful/field-editors

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

This is the monorepo for all field editors and apps by [Contentful][contentful].

Since these are developed using the [App SDK][app-sdk], this will allow you to understand how each editor works, fork existing apps or create your own apps based on existing Contentful components' source rather than starting from scratch.

It uses [Typescript][typescript], [React][react], [Forma36][forma36] (a design system & component library by Contentful) and is managed using [Lerna][lerna]. Code is automatically formatted with [Prettier][prettier] and checked with [ESLint][eslint] on every commit using Git hooks.

## Available field editors

Playground with all components: [https://contentful-field-editors.netlify.app/](https://contentful-field-editors.netlify.app/)

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

To achieve the same field editor look as in the Contentful UI, you need to include Contentful's Forma 36 styles in your project.

```
import '@contentful/forma-36-react-components/dist/styles.css';
```

## Getting started & contributing

### Requirements

- Node.js: `>=12.13.1`
- Yarn: `>=1.21.1`

To install all dependencies and build all packages run the following commands from the root of the project.

```
yarn
yarn build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get started.

We'd love to have your helping hand on `@contentful/field-editors`!

## Links & related repositories

- [App SDK][app-sdk]
- [Create Contentful App CLI][create-contentful-app]
- [Forma36][forma36]

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
