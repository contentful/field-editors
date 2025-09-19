import type { LocalesAPI } from '@contentful/app-sdk';
import type { LocaleProps } from 'contentful-management';

export type SanitizedLocale = Pick<LocaleProps, 'code' | 'default' | 'name'>;

export function sanitizeLocales(
  locales: Pick<LocalesAPI, 'available' | 'default' | 'names'> | LocaleProps[],
): SanitizedLocale[] {
  if (Array.isArray(locales)) {
    return locales;
  }

  return locales.available.map((code) => ({
    code,
    default: code === locales.default,
    name: locales.names[code],
  }));
}
