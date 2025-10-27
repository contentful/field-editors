import * as React from 'react';
import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import Field from './locations/Field';
import Dialog from './locations/Dialog';

import { i18n } from '@lingui/core';

console.log('[DEBUG] Docs to Rich Text - i18n', { i18n });
i18n.activate('en-US');

const ComponentLocationSettings = {
  [locations.LOCATION_ENTRY_FIELD]: Field,
  [locations.LOCATION_DIALOG]: Dialog,
};

const App = () => {
  const sdk = useSDK();
  console.log('[DEBUG] RichTextApp - App SDK', { sdk });
  const Component = React.useMemo(() => {
    for (const [location, component] of Object.entries(ComponentLocationSettings)) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;
