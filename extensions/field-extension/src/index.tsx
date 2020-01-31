import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK, locations } from 'contentful-ui-extensions-sdk';
import { SlugEditor } from '../../../packages/slug/src/index';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/elegant.css';
import './index.css';

init<FieldExtensionSDK>(sdk => {
  if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    sdk.window.startAutoResizer();
    render(
      <SlugEditor field={sdk.field} baseSdk={sdk} isInitiallyDisabled={true} />,
      document.getElementById('root')
    );
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
