import { useMemo } from 'react';

import type { LocalesAPI } from '@contentful/app-sdk';
import type { AssetProps, EntryProps, LocaleProps } from 'contentful-management/types';

import * as entityHelpers from '../utils/entityHelpers';

export type LocalePublishStatus = {
  status: 'draft' | 'published' | 'changed';
  locale: Pick<LocaleProps, 'code' | 'default' | 'name'>;
};
export type LocalePublishStatusMap = Map<string, LocalePublishStatus>;

function getLocalePublishStatusMap(
  entity: AssetProps | EntryProps,
  localesApi: Pick<LocalesAPI, 'available' | 'default' | 'names'>
) {
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
  locales?: Pick<LocalesAPI, 'available' | 'default' | 'names'> | LocaleProps[] | null
): LocalePublishStatusMap | undefined {
  return useMemo(() => {
    if (entity && locales) {
      const localesApi = Array.isArray(locales)
        ? locales.reduce(
            (api, locale) => {
              api.available.push(locale.code);
              api.names[locale.code] = locale.name;
              if (locale.default) {
                api.default = locale.code;
              }

              return api;
            },
            {
              available: [],
              names: {},
              default: '',
            } as Pick<LocalesAPI, 'available' | 'default' | 'names'>
          )
        : locales;

      return getLocalePublishStatusMap(entity, localesApi);
    }

    return undefined;
  }, [entity, locales]);
}
