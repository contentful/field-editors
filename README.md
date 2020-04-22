# Contentful Field Editors ![early access program](https://img.shields.io/badge/careful-early_access_program-orange)

This is the monorepo for all field editors and extensions by [Contentful][contentful].

Since these are developed using the [UI Extensions SDK][ui-extensions-sdk], this will allow you to understand how each editor works, fork existing extensions or create your own extensions based on existing Contentful components' source rather than starting from scratch.

It uses [Typescript][typescript], [React][react], [Forma36][forma36] (a design system & component library by Contentful) and is managed using [Lerna][lerna]. Code is automatically formatted with [Prettier][prettier] and checked with [ESLint][eslint] on every commit using Git hooks.

## Available field editors

We currently provide the following field editors:

- [Single line editor](./packages/single-line/README.md)
- [Multi line editor](./packages/multiple-line/README.md)
- [Dropdown](./packages/dropdown/README.md)
- [Tags](./packages/tags/README.md)
- [List](./packages/list/README.md)
- [Checkbox](./packages/checkbox/README.md)
- [Radio](./packages/radio/README.md)
- [Boolean](./packages/boolean/README.md)
- [Rating](./packages/rating/README.md)
- [Number](./packages/number/README.md)
- [Url](./packages/url/README.md)
- [JSON](./packages/json/README.md)
- [Location](./packages/location/README.md)
- [Date](./packages/date/README.md)
- [Markdown](./packages/markdown/README.md)
- [Slug](./packages/slug/README.md)
- [Entry reference / Media](./packages/reference/README.md)
- [Rich Text](./packages/rich-text/README.md)

Feel free to reach out to us with the ones that'd be the most useful to have
here by filing a [Github issue][github-issues]!

## Contributing

We'd love to have your helping hand on `@contentful/field-editors`! See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to get started.

## Links

- [UI Extensions SDK][ui-extensions-sdk]
- [Create Contentful Extension CLI][create-contentful-extension]
- [Forma36][forma36]

## Code of Conduct

We want to provide a safe, inclusive, welcoming, and harassment-free space and experience for all participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers.

[Read our full Code of Conduct](https://github.com/contentful-developer-relations/community-code-of-conduct).

## License

All field editor packages are open source software [licensed as MIT](./LICENSE).

[contentful]: https://www.contentful.com
[ui-extensions-sdk]: https://github.com/contentful/ui-extensions-sdk
[create-contentful-extension]: https://github.com/contentful/create-contentful-extension
[github-issues]: https://github.com/contentful/core-field-editors/issues
[forma36]: https://f36.contentful.com/
[typescript]: https://www.typescriptlang.org/
[react]: https://reactjs.org/
[lerna]: https://github.com/lerna/lerna
[prettier]: https://prettier.io/
[eslint]: https://eslint.org/
