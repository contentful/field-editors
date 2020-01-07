import * as React from 'react';
import { render } from 'react-dom';
import {
  init,
  FieldExtensionSDK,
  locations,
  DialogExtensionSDK
} from 'contentful-ui-extensions-sdk';
import { MarkdownEditor, renderMarkdownDialog } from '../../../packages/markdown/src/index';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/elegant.css';
import './index.css';

init(sdk => {
  if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    const fieldSdk = sdk as FieldExtensionSDK;
    fieldSdk.window.startAutoResizer();
    render(
      <div style={{ minHeight: 300, marginTop: 10 }}>
        <MarkdownEditor
          sdk={fieldSdk}
          parameters={{ instance: { canUploadAssets: false } }}
          isInitiallyDisabled={true}
        />
      </div>,
      document.getElementById('root')
    );
  } else if (sdk.location.is(locations.LOCATION_DIALOG)) {
    const dialogSdk = sdk as DialogExtensionSDK;
    dialogSdk.window.startAutoResizer();
    render(renderMarkdownDialog(dialogSdk as any), document.getElementById('root'));
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
