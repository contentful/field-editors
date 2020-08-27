# @contentful/default-field-editors

```bash
npm install @contentful/default-field-editors
```

This package provides React components for rendering all supported field editors with the same structure and style as in Contentful web app.

```js
import 'codemirror/lib/codemirror.css';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/field-editor-date/styles/styles.css';
import { Field, FieldWrapper } from 'packages/default-field-editors';

const fieldEditor = (
  <FieldWrapper sdk={fieldExtensionSdk} name={fieldName} getEntryURL={(entry) => ''}>
    <Field sdk={fieldExtensionSdk} widgetId={widgetId} />
  </FieldWrapper>
);
```
