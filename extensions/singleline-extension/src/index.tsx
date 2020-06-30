import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
// import { SingleLineEditor } from '@contentful/field-editor-single-line';
import { SingleLineEditor } from '../../../packages/single-line/src';
import { Button } from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

interface AppProps {
  sdk: FieldExtensionSDK;
}

const App: React.FC<AppProps> = (props: AppProps) => {
  return (
    <div>
      <SingleLineEditor field={props.sdk.field} locales={props.sdk.locales} />
      <Button
        buttonType="primary"
        onClick={function () {
          fetch('https://catfact.ninja/fact')
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              props.sdk.field.setValue(data.fact);
            });
        }}>
        Cat Button
      </Button>
    </div>
  );
};

init((sdk: FieldExtensionSDK) => {
  sdk.window.startAutoResizer();
  render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
