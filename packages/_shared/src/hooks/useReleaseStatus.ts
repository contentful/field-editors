import { useMemo } from 'react';

import type { LocalesAPI } from '@contentful/app-sdk';
import type {
  AssetProps,
  EntryProps,
  LocaleProps,
  ReleaseProps,
} from 'contentful-management/types';

import type {
  ReleaseAction,
  ReleaseEntityStatus,
  ReleaseLocalesStatus,
  ReleaseV2Entity,
  ReleaseV2EntityWithLocales,
  ReleaseV2Props,
  ReleaseStatusMap,
} from '../types';
import { getEntityStatus } from '../utils/entityHelpers';
import { sanitizeLocales } from '../utils/sanitizeLocales';

function createReleaseLocaleStatus(
  locale: Pick<LocaleProps, 'code' | 'default' | 'name'>,
  status: ReleaseEntityStatus,
): ReleaseLocalesStatus {
  switch (status) {
    case 'published':
      return {
        variant: 'positive',
        status,
        label: 'Published',
        locale,
      };
    case 'willPublish':
      return {
        variant: 'positive',
        status: 'willPublish',
        label: 'Will publish',
        locale,
      };
    case 'becomesDraft':
      return {
        variant: 'warning',
        status: 'becomesDraft',
        label: 'Becomes draft',
        locale,
      };
    case 'remainsDraft':
      return {
        variant: 'warning',
        status: 'remainsDraft',
        label: 'Remains draft',
        locale,
      };
    case 'notInRelease':
      return {
        variant: 'secondary',
        status: 'notInRelease',
        label: 'Not in release',
        locale,
      };
    default:
      throw new Error(`Unknown release entity status: ${status}`);
  }
}

function getReleaseItemLocaleStatus(
  releaseItem: ReleaseV2Entity | ReleaseV2EntityWithLocales,
  locale: Pick<LocaleProps, 'code' | 'default' | 'name'>,
  previousEntityOnTimeline?: EntryProps | AssetProps,
): ReleaseEntityStatus {
  // Entry based
  if ('action' in releaseItem) {
    if (releaseItem.action === 'publish') {
      return 'willPublish';
    }

    if (releaseItem.action === 'unpublish') {
      const status = previousEntityOnTimeline
        ? getEntityStatus(previousEntityOnTimeline.sys)
        : 'draft';

      return ['published', 'changed'].includes(status) ? 'becomesDraft' : 'remainsDraft';
    }
  }

  // Locale based
  const addedLocales = (releaseItem as ReleaseV2EntityWithLocales).add?.fields['*'] || [];
  const removedLocales = (releaseItem as ReleaseV2EntityWithLocales).remove?.fields['*'] || [];

  if (addedLocales.includes(locale.code)) {
    return 'willPublish';
  }

  if (removedLocales.includes(locale.code)) {
    const status = previousEntityOnTimeline
      ? getEntityStatus(previousEntityOnTimeline.sys, locale.code)
      : 'draft';
    return ['published', 'changed'].includes(status) ? 'becomesDraft' : 'remainsDraft';
  }

  return 'remainsDraft';
}

type UseActiveReleaseLocalesStatuses = {
  entity?: EntryProps | AssetProps;
  locales: LocaleProps[] | LocalesAPI;
  release?: ReleaseProps | ReleaseV2Props;
  previousEntityOnTimeline?: EntryProps | AssetProps;
};

export function useReleaseStatus({
  entity,
  release,
  locales,
  previousEntityOnTimeline,
}: UseActiveReleaseLocalesStatuses) {
  const sanitizedLocales = useMemo(() => sanitizeLocales(locales), [locales]);

  const releaseStatusMap: ReleaseStatusMap = useMemo(() => {
    if (
      !entity?.sys ||
      !release ||
      !('schemaVersion' in release.sys) ||
      release.sys.schemaVersion !== 'Release.v2'
    ) {
      return new Map();
    }

    const releaseItem = (release as ReleaseV2Props).entities.items.find(
      (e) => e.entity.sys.linkType === entity.sys.type && e.entity.sys.id === entity.sys.id,
    );

    if (!releaseItem) {
      return new Map(
        sanitizedLocales.map((locale) => {
          if (['published', 'changed'].includes(getEntityStatus(entity.sys, locale.code))) {
            return [locale.code, createReleaseLocaleStatus(locale, 'published')];
          }

          return [locale.code, createReleaseLocaleStatus(locale, 'notInRelease')];
        }),
      );
    }

    return new Map(
      sanitizedLocales.map((locale) => [
        locale.code,
        createReleaseLocaleStatus(
          locale,
          getReleaseItemLocaleStatus(releaseItem, locale, previousEntityOnTimeline),
        ),
      ]),
    );
  }, [entity?.sys, previousEntityOnTimeline, release, sanitizedLocales]);

  const releaseAction: ReleaseAction | undefined = useMemo(() => {
    if (releaseStatusMap.size === 0) {
      return undefined;
    }

    const releaseArray = Array.from(releaseStatusMap.values());
    if (releaseArray.find(({ status }) => status === 'willPublish')) {
      return 'publish';
    }

    if (releaseArray.find(({ status }) => status === 'becomesDraft' || status === 'remainsDraft')) {
      return 'unpublish';
    }

    return 'not-in-release';
  }, [releaseStatusMap]);

  return {
    releaseStatusMap,
    releaseAction,
  };
}
