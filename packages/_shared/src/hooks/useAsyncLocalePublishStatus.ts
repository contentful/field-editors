import { useMemo } from 'react';

import type { AssetProps, EntryProps, LocaleProps } from 'contentful-management/types';

import * as entityHelpers from '../utils/entityHelpers';

export type LocalePublishStatus = {
  status: 'draft' | 'published' | 'changed';
  locale: LocaleProps;
};
export type LocalePublishStatusMap = Map<string, LocalePublishStatus>;

function getLocalePublishStatusMap(entity: AssetProps | EntryProps, locales: LocaleProps[]) {
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
    ])
  );

  return statusMap;
}

/**
 * Get the publish status for each locale
 */
export function useAsyncLocalePublishStatus(
  entity?: AssetProps | EntryProps,
  privateLocales?: LocaleProps[] | null
): LocalePublishStatusMap | undefined {
  return useMemo(() => {
    if (entity && privateLocales) {
      return getLocalePublishStatusMap(entity, privateLocales);
    }

    return undefined;
  }, [entity, privateLocales]);
}
