import * as React from 'react';
import { render } from 'react-dom';
import { FieldAppSDK, DialogAppSDK, init, locations } from '@contentful/app-sdk';
import { RichTextEditor, renderRichTextDialog } from '@contentful/field-editor-rich-text';
import { GlobalStyles } from '@contentful/f36-components';

init((sdk: FieldAppSDK | DialogAppSDK) => {
  sdk.window.startAutoResizer();
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    render(
      <>
        <GlobalStyles />
        {renderRichTextDialog(sdk as DialogAppSDK)}
      </>,
      document.getElementById('root')
    );
  } else {
    render(
      <>
        <GlobalStyles />
        <RichTextEditor sdk={sdk as FieldAppSDK} isInitiallyDisabled />
      </>,
      document.getElementById('root')
    );
  }
});

/**
 * By default, iframe of the app is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
