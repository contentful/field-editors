import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <SDKProvider>
    <GlobalStyles />
    <App />
  </SDKProvider>,
);

/**
 * By default, iframe of the app is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
