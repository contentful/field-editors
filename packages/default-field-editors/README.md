# @contentful/default-field-editors

```bash
npm install @contentful/default-field-editors
```

This package provides React components for rendering all supported field editors with the same structure and style as in Contentful web app.

## Example

```js
import 'codemirror/lib/codemirror.css';
import '@contentful/field-editor-date/styles/styles.css';
import { Field, FieldWrapper } from 'packages/default-field-editors';

const fieldEditor = (
  <FieldWrapper sdk={fieldExtensionSdk} name={fieldName}>
    <Field sdk={fieldExtensionSdk} widgetId="singleLine" />
  </FieldWrapper>
);
```

It is optional to specify `widgetId`, and when not specified we'll try to determine a default editor type to render based on the field configuration.

Otherwise, you can set it to one of many available editor types: `singleLine` for a single line text editor, `checkbox` for a checkbox input, etc.

You can see [the full list of supported widgets in the `WidgetType` type definition](https://github.com/contentful/field-editors/blob/master/packages/default-field-editors/src/types.ts#L24).
