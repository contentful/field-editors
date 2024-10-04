```js
import { RichTextEditor, renderRichTextDialog } from '@contentful/field-editor-rich-text';

/// your app code
init((sdk) => {
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    render(renderRichTextDialog(sdk), document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    render(
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />,
      document.getElementById('root')
    );
  }
});
```
