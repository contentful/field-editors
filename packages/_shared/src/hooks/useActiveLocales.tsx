import { useEffect, useState } from 'react';

import { BaseAppSDK, SharedEditorSDK } from '@contentful/app-sdk';

type LocaleSettings = {
  mode: 'single' | 'multi';
  active?: string[];
  focused?: string;
};

export type SDK = {
  editor?: SharedEditorSDK['editor'];
  locales: Pick<BaseAppSDK['locales'], 'available'>;
};

export function useActiveLocales(sdk: SDK) {
  const [activeLocales, setActiveLocales] = useState<Array<{ code: string }>>([]);

  useEffect(() => {
    // Set all available locales if editor is not available
    if (!sdk.editor) {
      setActiveLocales(sdk.locales.available.map((code) => ({ code })));
      return;
    }

    const availableLocales = new Set(sdk.locales.available);

    const updateLocales = (settings: LocaleSettings) => {
      let localeCodes: string[] = [];

      if (settings.mode === 'multi' && settings.active) {
        localeCodes = settings.active.filter((locale) => availableLocales.has(locale));
      } else if (
        settings.mode === 'single' &&
        settings.focused &&
        availableLocales.has(settings.focused)
      ) {
        localeCodes = [settings.focused];
      }

      setActiveLocales(localeCodes.map((code) => ({ code })));
    };

    // Set initial locales
    updateLocales(sdk.editor.getLocaleSettings());

    // Subscribe to changes
    const unsubscribe = sdk.editor.onLocaleSettingsChanged(updateLocales);

    return () => {
      unsubscribe();
    };
  }, [sdk.editor, sdk.locales.available]);

  return activeLocales;
}
