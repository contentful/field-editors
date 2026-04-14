import type { LocaleProps } from 'contentful-management';

import type {
  ReleaseAction,
  ReleaseV2Entity,
  ReleaseV2EntityWithLocales,
  ReleaseV2Props,
} from '../types';
import { determineReleaseAction } from './determineReleaseAction';

type GetEntityReleaseStatusResult = {
  releaseAction: ReleaseAction;
  localesCount?: number;
  entityItem?: ReleaseV2Entity | ReleaseV2EntityWithLocales;
  addLocales?: string[];
  removeLocales?: string[];
};

export function getEntityReleaseStatus(
  entityId: string,
  locales: LocaleProps[],
  release?: ReleaseV2Props,
): GetEntityReleaseStatusResult {
  const { releaseAction, entityItem, addLocales, removeLocales } = determineReleaseAction(
    entityId,
    release,
  );

  if (releaseAction === 'not-in-release' || !entityItem) {
    return { releaseAction };
  }

  // Entry based publishing
  if ('action' in entityItem) {
    return {
      releaseAction,
      localesCount: locales.length,
      entityItem,
    };
  }

  // Locale based publishing
  const localesCount = addLocales && addLocales.length > 0 ? addLocales.length : locales.length;

  return {
    releaseAction,
    localesCount,
    entityItem,
    addLocales,
    removeLocales,
  };
}
