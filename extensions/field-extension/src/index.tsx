import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import {
  SingleEntryReferenceEditor,
  MultipleEntryReferenceEditor,
  SingleAssetReferenceEditor
} from '../../../packages/reference/src/index';

import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

init<FieldExtensionSDK>(sdk => {
  const fieldSdk = sdk as FieldExtensionSDK;
  fieldSdk.window.startAutoResizer();
  render(
    <div style={{ minHeight: 400 }}>
      {fieldSdk.field.type === 'Link' && fieldSdk.field.id !== 'media' && (
        <SingleEntryReferenceEditor
          viewType="link"
          sdk={fieldSdk}
          isInitiallyDisabled={true}
          parameters={{
            instance: {
              canCreateEntry: true
            }
          }}
        />
      )}
      {fieldSdk.field.type === 'Link' && fieldSdk.field.id === 'media' && (
        <SingleAssetReferenceEditor
          viewType="card"
          sdk={fieldSdk}
          isInitiallyDisabled={true}
          parameters={{
            instance: {
              canCreateAsset: true
            }
          }}
        />
      )}
      {fieldSdk.field.type === 'Array' && (
        <MultipleEntryReferenceEditor
          viewType="link"
          sdk={fieldSdk}
          isInitiallyDisabled={true}
          parameters={{
            instance: {
              canCreateEntry: true
            }
          }}
        />
      )}
    </div>,
    document.getElementById('root')
  );
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
