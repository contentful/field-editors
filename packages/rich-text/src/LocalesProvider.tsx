import * as React from 'react';

import constate from 'constate';
import { LocaleProps } from 'contentful-management';

interface LocalesProviderProps {
  locales?: LocaleProps[];
}

function useLocales({ locales }: LocalesProviderProps) {
  const localesMemo = React.useMemo<LocaleProps[] | undefined>(() => locales, []); // eslint-disable-line -- TODO: explain this disable

  return localesMemo;
}

export const [LocalesProvider, useLocalesContext] = constate(useLocales);
