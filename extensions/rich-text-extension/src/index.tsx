import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK, locations } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import { RichTextEditor, renderRichTextDialog } from '../../../packages/rich-text/src/index';

interface AppProps {
  sdk: FieldExtensionSDK;
}

interface AppState {
  value?: string;
}

export class App extends React.Component<AppProps, AppState> {
  render = () => {
    const sdk = Object.assign(this.props.sdk, {
      parameters: {
        instance: {
          permissions: {
            canAccessAssets: true,
            canCreateAssets: true,
            canCreateEntryOfContentType: () => true
          }
        }
      }
    });
    return <RichTextEditor sdk={sdk} />;
  };
}

init((sdk: FieldExtensionSDK) => {
  sdk.window.startAutoResizer();
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    render(renderRichTextDialog(sdk), document.getElementById('root'));
  } else {
    render(<App sdk={sdk} />, document.getElementById('root'));
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
