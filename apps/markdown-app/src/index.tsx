import * as React from 'react';
import { render } from 'react-dom';
import { init, locations } from '@contentful/app-sdk';
import type { FieldExtensionSDK } from '@contentful/app-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import '@contentful/field-editor-markdown/src/codemirrorImports';
import { MarkdownEditor, renderMarkdownDialog } from '@contentful/field-editor-markdown';
import 'codemirror/lib/codemirror.css';

interface AppProps {
  sdk: FieldExtensionSDK;
}

export class App extends React.Component<AppProps> {
  render = () => {
    return <MarkdownEditor isInitiallyDisabled={false} sdk={this.props.sdk} />;
  };
}

init((sdk: FieldExtensionSDK) => {
  sdk.window.startAutoResizer();
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    render(renderMarkdownDialog(sdk as any), document.getElementById('root'));
  } else {
    render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
  }
});

/**
 * By default, iframe of the app is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
