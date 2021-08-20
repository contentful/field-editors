# @contentful/field-editor-shared

This package contains shared code (components, utilities, test utilities) that is used by all other field editor packages.

The most useful component for developing any kind of apps is `FieldConnector` that helps you to subscribe to field changes in a convenient way.

Checkout a simple implementation of an app for `Boolean` field:

```jsx

import { FieldConnector } from '@contentful/field-editor-shared';

<FieldConnector<boolean> field={sdk.field}>
    {({ disabled, value, setValue }) => {
      return (
        <div>
          <div>{value ? 'I am true' : 'I am false'}</div>
          <button onClick={() => {
            setValue(!value)
          }}>
            toggle
          </button>
        </div>
      )
    }}
</FieldConnector>

```
