# @contentful/field-editor-rich-text

```bash
npm install @contentful/field-editor-rich-text
```

This package contains a React `RichTextEditor` component that is used as the default for `RichText` field type in the Contentful web application.

```js
import { RichTextEditor } from '@contentful/field-editor-rich-text';
```

Pass `withSelectionSync={true}` to opt in to synchronizing the browser caret before editing.
It defaults to `false`. The host application can pass a feature flag's value through this prop;
the editor does not need its own feature flag service.

## ⚠️ Important: Package Configuration

Plate 53.3.14 pins `slate-react` to 0.126.4. To use the latest Slate React version tested by this package (0.127.1), update existing overrides in your application as shown below. Package-manager overrides in this repository are not inherited by applications that install the published package.

**For npm:**

```json
{
  "overrides": {
    "slate": "0.126.2",
    "slate-react": "0.127.1"
  }
}
```

**For yarn:**

```json
{
  "resolutions": {
    "slate": "0.126.2",
    "slate-react": "0.127.1"
  }
}
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
[plate]: https://platejs.org/
