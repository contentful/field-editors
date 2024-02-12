```js
import { SingleEntryReferenceEditor } from '@contentful/field-editor-reference';

/// your app code
init((sdk) => {
  if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    render(
      <SingleEntryReferenceEditor viewType="card" sdk={sdk} />,
      document.getElementById('root')
    );
  }
});
```
