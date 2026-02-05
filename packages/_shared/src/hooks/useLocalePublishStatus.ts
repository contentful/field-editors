import { useMemo } from 'react';

import type { LocalesAPI } from '@contentful/app-sdk';
import type { AssetProps, EntryProps, LocaleProps } from 'contentful-management';

import * as entityHelpers from '../utils/entityHelpers';
import { sanitizeLocales, type SanitizedLocale } from '../utils/sanitizeLocales';

export type PublishStatus = 'draft' | 'published' | 'changed';

export type LocalePublishStatus = {
  status: PublishStatus;
  locale: SanitizedLocale;
};
export type LocalePublishStatusMap = Map<string, LocalePublishStatus>;

function getLocalePublishStatusMap(entity: AssetProps | EntryProps, locales: SanitizedLocale[]) {
  const entityStatus = entityHelpers.getEntityStatus(entity.sys);

  if (['archived', 'deleted'].includes(entityStatus)) {
    return;
  }

  const statusMap: LocalePublishStatusMap = new Map(
    locales.map((locale) => [
      locale.code,
      {
        // save to cast as archived and deleted are already handled before
        status: entityHelpers.getEntityStatus(entity.sys, locale.code) as
          | 'draft'
          | 'published'
          | 'changed',
        locale,
      },
    ]),
  );

  return statusMap;
}

/**
 * Get the publish status for each locale
 */
export function useLocalePublishStatus(
  entity?: AssetProps | EntryProps,
  locales?: Pick<LocalesAPI, 'available' | 'default' | 'names'> | LocaleProps[] | null,
): LocalePublishStatusMap | undefined {
  return useMemo(() => {
    if (entity && locales) {
      return getLocalePublishStatusMap(entity, locales ? sanitizeLocales(locales) : []);
    }

    return undefined;
  }, [entity, locales]);
}
