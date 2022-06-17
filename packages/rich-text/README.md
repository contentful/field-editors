# @contentful/field-editor-rich-text

```bash
npm install @contentful/field-editor-rich-text
```

This package contains a React `RichTextEditor` component that is used as the default for `RichText` field type in the Contentful web application.

```js
import 'codemirror/lib/codemirror.css';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
```

## Migrating to v2

To bring support for Rich Text Tables we rewrote most of the internals of this package to adapt the latest version of [Slate][slate]. We are releasing this change as v2.0.0.

There are two ways our users typically use the rich-text field editor:

### 1. By embedding `@contentful/field-editor-rich-text` npm package

Since the public API exposed by the package remains the same, upgrading to v2 should be seamless as it's just a matter of installing the latest version from npm. No migration is needed.

### 2. By forking the source code

You will need to adapt your fork to work with v2. Here is a highlight of the major changes:

1. Using Slate >= v0.80.0. If you're upgrading from < 0.50.x Please check the library [migration guide](https://docs.slatejs.org/concepts/xx-migrating)
2. Using Plate as a plugin system. Plate is a powerful plugin system to make it easy to work with Slate. All of the existing rich text plugins were rewritten to use Plate. To learn more, please check Plate's [website][plate].

## Credits

This package is based on [Slate][slate] & [Plate][plate] and also borrows some of their code. Without them, this project would not have been possible.

[slate]: https://www.slatejs.org/
[plate]: https://plate.udecode.io/
