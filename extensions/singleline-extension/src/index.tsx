import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from '@contentful/app-sdk';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

interface AppProps {
  sdk: FieldExtensionSDK;
}

const App: React.FC<AppProps> = (props: AppProps) => {
  return (
    <div>
      <SingleLineEditor field={props.sdk.field} locales={props.sdk.locales} />
    </div>
  );
};

init((sdk: FieldExtensionSDK) => {
  sdk.window.startAutoResizer();
  render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});
