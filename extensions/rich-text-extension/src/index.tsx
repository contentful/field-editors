import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK, locations } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import { RichTextEditor, renderRichTextDialog } from '../../../packages/rich-text/src/index';

init((sdk: FieldExtensionSDK) => {
  sdk.window.startAutoResizer();
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    render(renderRichTextDialog(sdk), document.getElementById('root'));
  } else {
    render(<RichTextEditor sdk={sdk} />, document.getElementById('root'));
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
