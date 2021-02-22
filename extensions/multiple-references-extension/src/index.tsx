import * as React from 'react';
import { render } from 'react-dom';
import { MultipleEntryReferenceEditor } from '@contentful/field-editor-reference';
import { init, FieldExtensionSDK } from '@contentful/app-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

init<FieldExtensionSDK>((sdk) => {
  const fieldSdk = sdk as FieldExtensionSDK;
  fieldSdk.window.startAutoResizer();

  render(
    <div style={{ minHeight: 400 }}>
      <MultipleEntryReferenceEditor
        viewType="link"
        sdk={fieldSdk}
        isInitiallyDisabled={true}
        hasCardEditActions
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
