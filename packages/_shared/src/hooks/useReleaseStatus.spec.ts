import { renderHook } from '@testing-library/react';
import type { AssetProps, EntryProps, LocaleProps } from 'contentful-management';

import type {
  ReleaseEntityStatus,
  ReleaseV2Entity,
  ReleaseV2EntityWithLocales,
  ReleaseV2Props,
} from '../types';
import type { PublishStatus } from './useLocalePublishStatus';
import { useReleaseStatus } from './useReleaseStatus';

type EntityType = 'Entry' | 'Asset';

interface EntityBuilder {
  withStatus: (status: PublishStatus) => EntryProps | AssetProps;
  withId: (id: string) => EntityBuilder;
}

const createEntityBuilder = (entityType: EntityType, defaultId: string): EntityBuilder => {
  let currentId = defaultId;

  return {
    withId(id: string) {
      currentId = id;
      return this;
    },
    withStatus(status: PublishStatus) {
      return {
        sys: {
          id: currentId,
          type: entityType,
          fieldStatus: {
            '*': { 'en-US': status },
          },
          version: 3,
          publishedVersion: status === 'published' ? 2 : undefined,
        },
      } as unknown as EntryProps | AssetProps;
    },
  };
};

const entryBuilder = () => createEntityBuilder('Entry', 'entry-1');
const assetBuilder = () => createEntityBuilder('Asset', 'asset-1');

const createEntryBasedReleaseEntity = ({
  entityId,
  action = 'publish',
  entityType,
}: {
  entityId: string;
  action?: 'publish' | 'unpublish';
  entityType: EntityType;
}): ReleaseV2Entity =>
  ({
    entity: {
      sys: { type: 'Link', linkType: entityType, id: entityId },
    },
    action,
  }) as ReleaseV2Entity;

const createEntryBasedRelease = ({
  entityId,
  action,
  entityType,
}: {
  entityId: string;
  action?: 'publish' | 'unpublish';
  entityType: EntityType;
}): ReleaseV2Props =>
  ({
    title: 'Release 1',
    sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v2' },
    entities: { items: [createEntryBasedReleaseEntity({ entityId, action, entityType })] },
  }) as ReleaseV2Props;

const createLocaleBasedReleaseEntity = ({
  entityId,
  verb = 'add',
  entityType,
}: {
  entityId: string;
  verb?: 'add' | 'remove';
  entityType: EntityType;
}): ReleaseV2EntityWithLocales =>
  ({
    entity: {
      sys: { type: 'Link', linkType: entityType, id: entityId },
    },
    [verb]: {
      fields: { '*': ['en-US'] },
    },
  }) as ReleaseV2EntityWithLocales;

const createLocaleBasedRelease = ({
  entityId,
  verb,
  entityType,
}: {
  entityId: string;
  verb?: 'add' | 'remove';
  entityType: EntityType;
}): ReleaseV2Props =>
  ({
    title: 'Release 1',
    sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v2' },
    entities: { items: [createLocaleBasedReleaseEntity({ entityId, verb, entityType })] },
  }) as ReleaseV2Props;

const createDefaultLocales = (): LocaleProps[] => [{ code: 'en-US' } as LocaleProps];

interface ExpectedStatus {
  variant: 'positive' | 'warning' | 'secondary';
  status: ReleaseEntityStatus;
  label: string;
  locale: { code: string };
}

const expectLocaleStatus = (
  result: ReturnType<typeof useReleaseStatus>,
  localeCode: string,
  expected: ExpectedStatus,
) => {
  expect(result.releaseStatusMap.get(localeCode)).toEqual(expected);
};

const expectEntityStatus = (
  result: ReturnType<typeof useReleaseStatus>,
  expectedStatus: ReleaseEntityStatus,
) => {
  expect(result.releaseEntityStatus).toBe(expectedStatus);
};

const ENTITY_TYPES: EntityType[] = ['Entry', 'Asset'];

describe('useReleaseStatus', () => {
  ENTITY_TYPES.forEach((entityType) => {
    const defaultEntityId = entityType === 'Entry' ? 'entry-1' : 'asset-1';
    const differentEntityId = entityType === 'Entry' ? 'entry-2' : 'asset-2';
    const locales = createDefaultLocales();

    const buildEntity = (status: PublishStatus): EntryProps | AssetProps => {
      const builder = entityType === 'Entry' ? entryBuilder() : assetBuilder();
      return builder.withStatus(status);
    };

    describe(`${entityType} as reference with entry-based publishing`, () => {
      it('returns "Will publish" status when entity is in release with publish action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createEntryBasedRelease({ entityId: defaultEntityId, entityType }),
            entity: buildEntity('published'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'positive',
          status: 'willPublish',
          label: 'Will publish',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Becomes draft" status when previously published entity has unpublish action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('published'),
            release: createEntryBasedRelease({
              action: 'unpublish',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'becomesDraft',
          label: 'Becomes draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Remains draft" status when previously draft entity has unpublish action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createEntryBasedRelease({
              action: 'unpublish',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'remainsDraft',
          label: 'Remains draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Not in release" status when entity is draft and not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createEntryBasedRelease({
              entityId: differentEntityId,
              action: 'publish',
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Published" status when entity is published and not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createEntryBasedRelease({
              entityId: differentEntityId,
              action: 'publish',
              entityType,
            }),
            entity: buildEntity('published'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'positive',
          status: 'published',
          label: 'Published',
          locale: { code: 'en-US' },
        });
        expectEntityStatus(result.current, 'published');
      });
    });

    describe(`${entityType} as reference with locale-based publishing`, () => {
      it('returns "Will publish" status when entity is in release with add action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createLocaleBasedRelease({ entityId: defaultEntityId, entityType }),
            entity: buildEntity('published'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'positive',
          status: 'willPublish',
          label: 'Will publish',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Becomes draft" status when previously published entity has remove action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('published'),
            release: createLocaleBasedRelease({
              verb: 'remove',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'becomesDraft',
          label: 'Becomes draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Remains draft" status when previously draft entity has remove action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createLocaleBasedRelease({
              verb: 'remove',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'remainsDraft',
          label: 'Remains draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Not in release" status when draft entity is not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createLocaleBasedRelease({
              entityId: differentEntityId,
              entityType,
              verb: 'add',
            }),
            entity: buildEntity('draft'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Published" status when published entity is not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createLocaleBasedRelease({
              entityId: differentEntityId,
              entityType,
              verb: 'add',
            }),
            entity: buildEntity('published'),
            isReference: true,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'positive',
          status: 'published',
          label: 'Published',
          locale: { code: 'en-US' },
        });
        expectEntityStatus(result.current, 'published');
      });
    });

    describe(`${entityType} NOT as reference with entry-based publishing`, () => {
      it('returns "Will publish" status when entity is in release with publish action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createEntryBasedRelease({ entityId: defaultEntityId, entityType }),
            entity: buildEntity('published'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'positive',
          status: 'willPublish',
          label: 'Will publish',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Becomes draft" status when previously published entity has unpublish action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('published'),
            release: createEntryBasedRelease({
              action: 'unpublish',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'becomesDraft',
          label: 'Becomes draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Remains draft" status when previously draft entity has unpublish action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createEntryBasedRelease({
              action: 'unpublish',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'remainsDraft',
          label: 'Remains draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Not in release" status when entity is draft and not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createEntryBasedRelease({
              entityId: differentEntityId,
              action: 'publish',
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Not in release" status when entity is published and not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createEntryBasedRelease({
              entityId: differentEntityId,
              action: 'publish',
              entityType,
            }),
            entity: buildEntity('published'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
        expectEntityStatus(result.current, 'notInRelease');
      });
    });

    describe(`${entityType} NOT as reference with locale-based publishing`, () => {
      it('returns "Will publish" status when entity is in release with add action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createLocaleBasedRelease({ entityId: defaultEntityId, entityType }),
            entity: buildEntity('published'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'positive',
          status: 'willPublish',
          label: 'Will publish',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Becomes draft" status when previously published entity has remove action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('published'),
            release: createLocaleBasedRelease({
              verb: 'remove',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'becomesDraft',
          label: 'Becomes draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Remains draft" status when previously draft entity has remove action', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            previousEntityOnTimeline: buildEntity('draft'),
            release: createLocaleBasedRelease({
              verb: 'remove',
              entityId: defaultEntityId,
              entityType,
            }),
            entity: buildEntity('draft'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'warning',
          status: 'remainsDraft',
          label: 'Remains draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Not in release" status when draft entity is not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createLocaleBasedRelease({
              entityId: differentEntityId,
              entityType,
              verb: 'add',
            }),
            entity: buildEntity('draft'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
      });

      it('returns "Not in release" status when published entity is not in release', () => {
        const { result } = renderHook(() =>
          useReleaseStatus({
            locales,
            release: createLocaleBasedRelease({
              entityId: differentEntityId,
              entityType,
              verb: 'add',
            }),
            entity: buildEntity('published'),
            isReference: false,
          }),
        );

        expectLocaleStatus(result.current, 'en-US', {
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
        expectEntityStatus(result.current, 'notInRelease');
      });
    });
  });
});
