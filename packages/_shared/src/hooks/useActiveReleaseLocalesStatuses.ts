import { useCallback, useMemo } from 'react';

import type { ReleaseAction, ReleaseLocalesStatusMap } from '@contentful/field-editor-shared';
import type {
  AssetProps,
  CollectionProp,
  EntryProps,
  LocaleProps,
} from 'contentful-management/types';

import type { ReleaseV2Entity, ReleaseV2EntityWithLocales, ReleaseV2Props } from '../types';
import { getPreviousReleaseEntity } from '../utils/getPreviousReleaseEntity';

export const useActiveReleaseLocalesStatuses = ({
  currentEntityDraft,
  entityId,
  entityType,
  releaseVersionMap,
  locales,
  activeRelease,
  releases,
}: {
  currentEntityDraft: EntryProps | AssetProps;
  entityId: string;
  entityType: 'Entry' | 'Asset';
  releaseVersionMap: Map<string, Map<string, ReleaseAction>>;
  locales: LocaleProps[];
  activeRelease: ReleaseV2Props | undefined;
  releases: CollectionProp<ReleaseV2Props> | undefined;
}) => {
  const previousReleaseEntity = useMemo(
    () =>
      getPreviousReleaseEntity({
        entityId,
        entityType,
        releaseVersionMap,
        activeRelease,
        releases,
      }).previousReleaseEntity,
    [entityId, entityType, releaseVersionMap, activeRelease, releases],
  );
  const activeReleaseReleaseEntity = useMemo(
    () =>
      activeRelease?.entities.items.find(
        (entity) => entity.entity.sys.id === entityId && entity.entity.sys.linkType === entityType,
      ),
    [activeRelease?.entities.items, entityId, entityType],
  );

  const getLocaleStatus = useCallback(
    (localeCode: string) => {
      if (!activeReleaseReleaseEntity) {
        return 'Not in release';
      }

      return (activeReleaseReleaseEntity as ReleaseV2Entity)?.action === 'publish' ||
        (activeReleaseReleaseEntity as ReleaseV2EntityWithLocales)?.add?.fields['*'].includes(
          localeCode,
        )
        ? 'published'
        : 'draft';
    },
    [activeReleaseReleaseEntity],
  );

  const releaseLocalesStatusMap: ReleaseLocalesStatusMap = useMemo(() => {
    return locales.reduce((acc, locale) => {
      acc.set(locale.code, {
        variant: 'secondary',
        status: 'remainsDraft',
        label: 'Remains draft',
        locale,
      });

      if (!activeReleaseReleaseEntity) {
        acc.set(locale.code, {
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale,
        });
        return acc;
      }

      if (getLocaleStatus(locale.code) === 'draft') {
        if (currentEntityDraft?.sys.fieldStatus) {
          const previousStatus = currentEntityDraft.sys.fieldStatus['*'][locale.code];
          if (previousStatus === 'published' || previousStatus === 'changed') {
            acc.set(locale.code, {
              status: 'becomesDraft',
              variant: 'warning',
              label: 'Becomes draft',
              locale,
            });
          } else {
            acc.set(locale.code, {
              status: 'remainsDraft',
              variant: 'secondary',
              label: 'Remains draft',
              locale,
            });
          }
        } else if (previousReleaseEntity) {
          if (
            (previousReleaseEntity as ReleaseV2Entity).action === 'publish' ||
            (previousReleaseEntity as ReleaseV2EntityWithLocales).add.fields['*'].includes(
              locale.code,
            )
          ) {
            acc.set(locale.code, {
              status: 'becomesDraft',
              variant: 'warning',
              label: 'Becomes draft',
              locale,
            });
          } else {
            acc.set(locale.code, {
              status: 'remainsDraft',
              variant: 'secondary',
              label: 'Remains draft',
              locale,
            });
          }
        }
      } else if (getLocaleStatus(locale.code) === 'published') {
        acc.set(locale.code, {
          variant: 'positive',
          status: 'willPublish',
          label: 'Will publish',
          locale,
        });
      }

      return acc;
    }, new Map() as ReleaseLocalesStatusMap);
  }, [
    locales,
    activeReleaseReleaseEntity,
    getLocaleStatus,
    currentEntityDraft?.sys.fieldStatus,
    previousReleaseEntity,
  ]);

  return {
    releaseLocalesStatusMap,
  };
};
