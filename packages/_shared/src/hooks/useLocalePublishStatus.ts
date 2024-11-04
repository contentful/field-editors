import { useMemo } from 'react';

import type { LocalesAPI } from '@contentful/app-sdk';
import type { AssetProps, EntryProps, LocaleProps } from 'contentful-management/types';

import * as entityHelpers from '../utils/entityHelpers';

export type LocalePublishStatus = {
  status: 'draft' | 'published' | 'changed';
  locale: Pick<LocaleProps, 'code' | 'default' | 'name'>;
};
export type LocalePublishStatusMap = Map<string, LocalePublishStatus>;

function getLocalePublishStatusMap(entity: AssetProps | EntryProps, localesApi: LocalesAPI) {
  const entityStatus = entityHelpers.getEntityStatus(entity.sys);

  if (['archived', 'deleted'].includes(entityStatus)) {
    return;
  }

  const statusMap: LocalePublishStatusMap = new Map(
    localesApi.available.map((localeCode) => [
      localeCode,
      {
        // save to cast as archived and deleted are already handled before
        status: entityHelpers.getEntityStatus(entity.sys, localeCode) as
          | 'draft'
          | 'published'
          | 'changed',
        locale: {
          code: localeCode,
          default: localeCode === localesApi.default,
          name: localesApi.names[localeCode],
        },
      },
    ])
  );

  return statusMap;
}

/**
 * Get the publish status for each locale
 */
export function useLocalePublishStatus(
  entity?: AssetProps | EntryProps,
  localesApi?: LocalesAPI | null
): LocalePublishStatusMap | undefined {
  return useMemo(() => {
    if (entity && localesApi) {
      return getLocalePublishStatusMap(entity, localesApi);
    }

    return undefined;
  }, [entity, localesApi]);
}
