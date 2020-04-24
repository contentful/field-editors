import * as React from 'react';
import { render } from 'react-dom';
import { MultipleEntryReferenceEditor } from '../../../packages/reference/src/index';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

init<FieldExtensionSDK>(sdk => {
  const fieldSdk = sdk as FieldExtensionSDK;
  fieldSdk.window.startAutoResizer();

  render(
    <div style={{ minHeight: 400 }}>
      <MultipleEntryReferenceEditor
        viewType="link"
        sdk={fieldSdk}
        isInitiallyDisabled={true}
        parameters={{
          instance: {
            canCreateEntity: true,
            canLinkEntity: true
          }
        }}
      />
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
