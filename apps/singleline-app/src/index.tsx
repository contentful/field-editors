import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldAppSDK } from '@contentful/app-sdk';
import { GlobalStyles } from '@contentful/f36-components';
import { SingleLineEditor } from '@contentful/field-editor-single-line';

interface AppProps {
  sdk: FieldAppSDK;
}

const App: React.FC<AppProps> = (props: AppProps) => {
  return (
    <div>
      <GlobalStyles />
      <SingleLineEditor field={props.sdk.field} locales={props.sdk.locales} />
    </div>
  );
};

init((sdk: FieldAppSDK) => {
  sdk.window.startAutoResizer();
  render(<App sdk={sdk as FieldAppSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the app is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
