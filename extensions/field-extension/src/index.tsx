import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { LocationEditor } from '../../../packages/location/src/index';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

init(sdk => {
  const fieldSdk = sdk as FieldExtensionSDK;
  fieldSdk.window.startAutoResizer();
  render(
    <div style={{ minHeight: 500 }}>
      <LocationEditor
        field={fieldSdk.field}
        parameters={{
          instance: { googleMapsKey: '' },
          installation: {}
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
