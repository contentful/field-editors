import * as React from 'react';
import { render } from 'react-dom';
import { MultipleEntryReferenceEditor } from '@contentful/field-editor-reference';
import { init } from '@contentful/app-sdk';
import type { FieldExtensionSDK } from '@contentful/app-sdk';
import { GlobalStyles } from '@contentful/f36-components';

init<FieldExtensionSDK>((sdk) => {
  const fieldSdk = sdk as FieldExtensionSDK;
  fieldSdk.window.startAutoResizer();

  render(
    <div style={{ minHeight: 400 }}>
      <GlobalStyles />
      <MultipleEntryReferenceEditor
        viewType="link"
        sdk={fieldSdk}
        isInitiallyDisabled={true}
        hasCardEditActions={true}
        parameters={{
          instance: {
            showCreateEntityAction: true,
            showLinkEntityAction: true,
          },
        }}
      />
    </div>,
    document.getElementById('root')
  );
});

/**
 * By default, iframe of the app is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
