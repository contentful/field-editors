import * as React from 'react';
import { render } from 'react-dom';
import { init, locations, FieldExtensionSDK } from '@contentful/app-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
// import '@contentful/field-editor-markdown/dist/codemirrorImports';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/edit/continuelist';
import 'codemirror/addon/mode/overlay';
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
