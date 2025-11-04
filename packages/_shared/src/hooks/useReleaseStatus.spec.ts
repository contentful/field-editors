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
  const locales = createDefaultLocales();

  describe('Guard clauses and invalid inputs', () => {
    it('returns empty map when entity is undefined', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          release: createEntryBasedRelease({ entityId: 'entry-1', entityType: 'Entry' }),
          entity: undefined,
        }),
      );

      expect(result.current.releaseStatusMap.size).toBe(0);
    });

    it('returns empty map when release is undefined', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          entity: entryBuilder().withStatus('published'),
          release: undefined,
        }),
      );

      expect(result.current.releaseStatusMap.size).toBe(0);
    });

    it('returns empty map when release has no schemaVersion', () => {
      const invalidRelease = {
        title: 'Release 1',
        sys: { id: 'release-1', type: 'Release' },
        entities: { items: [] },
      } as unknown as ReleaseV2Props;

      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          entity: entryBuilder().withStatus('published'),
          release: invalidRelease,
        }),
      );

      expect(result.current.releaseStatusMap.size).toBe(0);
    });

    it('returns empty map when release schema is not v2', () => {
      const oldSchemaRelease = {
        title: 'Release 1',
        sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v1' },
        entities: { items: [] },
      } as unknown as ReleaseV2Props;

      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          entity: entryBuilder().withStatus('published'),
          release: oldSchemaRelease,
        }),
      );

      expect(result.current.releaseStatusMap.size).toBe(0);
    });
  });

  describe('Edge case: Missing previousEntityOnTimeline', () => {
    it('defaults to "Remains draft" when unpublishing without previous state (entry-based)', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          previousEntityOnTimeline: undefined,
          release: createEntryBasedRelease({
            entityId: 'entry-1',
            entityType: 'Entry',
            action: 'unpublish',
          }),
          entity: entryBuilder().withStatus('draft'),
        }),
      );

      expectLocaleStatus(result.current, 'en-US', {
        variant: 'warning',
        status: 'remainsDraft',
        label: 'Remains draft',
        locale: { code: 'en-US' },
      });
    });

    it('defaults to "Remains draft" when removing locale without previous state (locale-based)', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          previousEntityOnTimeline: undefined,
          release: createLocaleBasedRelease({
            entityId: 'entry-1',
            entityType: 'Entry',
            verb: 'remove',
          }),
          entity: entryBuilder().withStatus('draft'),
        }),
      );

      expectLocaleStatus(result.current, 'en-US', {
        variant: 'warning',
        status: 'remainsDraft',
        label: 'Remains draft',
        locale: { code: 'en-US' },
      });
    });
  });

  describe('Changed status handling', () => {
    const buildChangedEntry = (): EntryProps =>
      ({
        sys: {
          id: 'entry-1',
          type: 'Entry',
          fieldStatus: {
            '*': { 'en-US': 'changed' },
          },
          version: 5,
          publishedVersion: 2,
        },
      }) as unknown as EntryProps;

    it('treats "changed" as published-like when unpublishing (entry-based)', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          previousEntityOnTimeline: buildChangedEntry(),
          release: createEntryBasedRelease({
            entityId: 'entry-1',
            entityType: 'Entry',
            action: 'unpublish',
          }),
          entity: entryBuilder().withStatus('draft'),
        }),
      );

      expectLocaleStatus(result.current, 'en-US', {
        variant: 'warning',
        status: 'becomesDraft',
        label: 'Becomes draft',
        locale: { code: 'en-US' },
      });
    });

    it('treats "changed" as published-like when removing locale (locale-based)', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          previousEntityOnTimeline: buildChangedEntry(),
          release: createLocaleBasedRelease({
            entityId: 'entry-1',
            entityType: 'Entry',
            verb: 'remove',
          }),
          entity: entryBuilder().withStatus('draft'),
        }),
      );

      expectLocaleStatus(result.current, 'en-US', {
        variant: 'warning',
        status: 'becomesDraft',
        label: 'Becomes draft',
        locale: { code: 'en-US' },
      });
    });

    it('shows "Published" for changed reference not in release', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          release: createEntryBasedRelease({
            entityId: 'entry-2',
            entityType: 'Entry',
            action: 'publish',
          }),
          entity: buildChangedEntry(),
          isReference: true,
        }),
      );

      expectLocaleStatus(result.current, 'en-US', {
        variant: 'positive',
        status: 'published',
        label: 'Published',
        locale: { code: 'en-US' },
      });
    });
  });

  describe('Multi-locale scenarios', () => {
    const multiLocales: LocaleProps[] = [
      { code: 'en-US' } as LocaleProps,
      { code: 'de-DE' } as LocaleProps,
    ];

    const buildMultiLocaleEntry = (enStatus: PublishStatus, deStatus: PublishStatus): EntryProps =>
      ({
        sys: {
          id: 'entry-1',
          type: 'Entry',
          fieldStatus: {
            '*': { 'en-US': enStatus, 'de-DE': deStatus },
          },
          version: 3,
          publishedVersion: enStatus === 'published' || deStatus === 'published' ? 2 : undefined,
        },
      }) as unknown as EntryProps;

    it('creates status for each locale', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales: multiLocales,
          release: createEntryBasedRelease({
            entityId: 'entry-1',
            entityType: 'Entry',
            action: 'publish',
          }),
          entity: buildMultiLocaleEntry('draft', 'draft'),
        }),
      );

      expect(result.current.releaseStatusMap.size).toBe(2);
      expect(result.current.releaseStatusMap.has('en-US')).toBe(true);
      expect(result.current.releaseStatusMap.has('de-DE')).toBe(true);
    });

    it('aggregates to "published" when any locale is published', () => {
      const publishedEntity = buildMultiLocaleEntry('published', 'draft');

      const { result } = renderHook(() =>
        useReleaseStatus({
          locales: multiLocales,
          release: createEntryBasedRelease({
            entityId: 'entry-2',
            entityType: 'Entry',
            action: 'publish',
          }),
          entity: publishedEntity,
          isReference: true,
        }),
      );

      expectEntityStatus(result.current, 'published');
    });

    it('aggregates to "willPublish" when any locale will publish', () => {
      const { result } = renderHook(() =>
        useReleaseStatus({
          locales: multiLocales,
          release: createEntryBasedRelease({
            entityId: 'entry-1',
            entityType: 'Entry',
            action: 'publish',
          }),
          entity: buildMultiLocaleEntry('draft', 'draft'),
        }),
      );

      expectEntityStatus(result.current, 'willPublish');
    });

    it('handles locale not in add/remove arrays', () => {
      const releaseWithDifferentLocale: ReleaseV2Props = {
        title: 'Release 1',
        sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v2' },
        entities: {
          items: [
            {
              entity: {
                sys: { type: 'Link', linkType: 'Entry', id: 'entry-1' },
              },
              add: {
                fields: { '*': ['de-DE'] },
              },
            } as ReleaseV2EntityWithLocales,
          ],
        },
      } as ReleaseV2Props;

      const { result } = renderHook(() =>
        useReleaseStatus({
          locales,
          release: releaseWithDifferentLocale,
          entity: entryBuilder().withStatus('draft'),
        }),
      );

      expectLocaleStatus(result.current, 'en-US', {
        variant: 'warning',
        status: 'remainsDraft',
        label: 'Remains draft',
        locale: { code: 'en-US' },
      });
    });
  });

  // Primary organization: isReference (true vs false) - the key behavioral difference
  // Secondary: Publishing model (entry-based vs locale-based)
  // Tertiary: Entity type (Entry vs Asset) - behavior is identical

  const testPublishingScenarios = (config: {
    isReference: boolean;
    publishingModel: 'entry-based' | 'locale-based';
  }) => {
    const { isReference, publishingModel } = config;
    const locales = createDefaultLocales();

    ENTITY_TYPES.forEach((entityType) => {
      const defaultEntityId = entityType === 'Entry' ? 'entry-1' : 'asset-1';
      const differentEntityId = entityType === 'Entry' ? 'entry-2' : 'asset-2';

      const buildEntity = (status: PublishStatus) => {
        const builder = entityType === 'Entry' ? entryBuilder() : assetBuilder();
        return builder.withStatus(status);
      };

      const createRelease = (options: {
        entityId: string;
        action?: 'publish' | 'unpublish';
        verb?: 'add' | 'remove';
      }) => {
        return publishingModel === 'entry-based'
          ? createEntryBasedRelease({
              entityId: options.entityId,
              entityType,
              action: options.action || 'publish',
            })
          : createLocaleBasedRelease({
              entityId: options.entityId,
              entityType,
              verb: options.verb || 'add',
            });
      };

      const publishAction = publishingModel === 'entry-based' ? 'publish' : 'add';
      const unpublishAction = publishingModel === 'entry-based' ? 'unpublish' : 'remove';

      describe(`${entityType}`, () => {
        it(`[${publishAction}] shows "Will publish" when entity transitions draft → published`, () => {
          const { result } = renderHook(() =>
            useReleaseStatus({
              locales,
              previousEntityOnTimeline: buildEntity('draft'),
              release: createRelease({
                entityId: defaultEntityId,
                action: 'publish',
                verb: 'add',
              }),
              entity: buildEntity('published'),
              isReference,
            }),
          );

          expectLocaleStatus(result.current, 'en-US', {
            variant: 'positive',
            status: 'willPublish',
            label: 'Will publish',
            locale: { code: 'en-US' },
          });
        });

        it(`[${unpublishAction}] shows "Becomes draft" when entity transitions published → draft`, () => {
          const { result } = renderHook(() =>
            useReleaseStatus({
              locales,
              previousEntityOnTimeline: buildEntity('published'),
              release: createRelease({
                entityId: defaultEntityId,
                action: 'unpublish',
                verb: 'remove',
              }),
              entity: buildEntity('draft'),
              isReference,
            }),
          );

          expectLocaleStatus(result.current, 'en-US', {
            variant: 'warning',
            status: 'becomesDraft',
            label: 'Becomes draft',
            locale: { code: 'en-US' },
          });
        });

        it(`[${unpublishAction}] shows "Remains draft" when entity stays draft → draft`, () => {
          const { result } = renderHook(() =>
            useReleaseStatus({
              locales,
              previousEntityOnTimeline: buildEntity('draft'),
              release: createRelease({
                entityId: defaultEntityId,
                action: 'unpublish',
                verb: 'remove',
              }),
              entity: buildEntity('draft'),
              isReference,
            }),
          );

          expectLocaleStatus(result.current, 'en-US', {
            variant: 'warning',
            status: 'remainsDraft',
            label: 'Remains draft',
            locale: { code: 'en-US' },
          });
        });

        if (isReference) {
          it('[not in release] shows "Published" when entity is published (returns actual state)', () => {
            const { result } = renderHook(() =>
              useReleaseStatus({
                locales,
                release: createRelease({
                  entityId: differentEntityId,
                  action: 'publish',
                  verb: 'add',
                }),
                entity: buildEntity('published'),
                isReference,
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

          it('[not in release] shows "Not in release" when entity is draft (returns actual state)', () => {
            const { result } = renderHook(() =>
              useReleaseStatus({
                locales,
                release: createRelease({
                  entityId: differentEntityId,
                  action: 'publish',
                  verb: 'add',
                }),
                entity: buildEntity('draft'),
                isReference,
              }),
            );

            expectLocaleStatus(result.current, 'en-US', {
              variant: 'secondary',
              status: 'notInRelease',
              label: 'Not in release',
              locale: { code: 'en-US' },
            });
          });
        } else {
          it('[not in release] returns "notInRelease" even when published (ignores actual state)', () => {
            const { result } = renderHook(() =>
              useReleaseStatus({
                locales,
                release: createRelease({
                  entityId: differentEntityId,
                  action: 'publish',
                  verb: 'add',
                }),
                entity: buildEntity('published'),
                isReference,
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

          it('[not in release] returns "notInRelease" when draft (consistent regardless of state)', () => {
            const { result } = renderHook(() =>
              useReleaseStatus({
                locales,
                release: createRelease({
                  entityId: differentEntityId,
                  action: 'publish',
                  verb: 'add',
                }),
                entity: buildEntity('draft'),
                isReference,
              }),
            );

            expectLocaleStatus(result.current, 'en-US', {
              variant: 'secondary',
              status: 'notInRelease',
              label: 'Not in release',
              locale: { code: 'en-US' },
            });
          });
        }
      });
    });
  };

  describe('When entity is a reference (isReference: true)', () => {
    describe('Entry-based publishing', () => {
      testPublishingScenarios({ isReference: true, publishingModel: 'entry-based' });
    });

    describe('Locale-based publishing', () => {
      testPublishingScenarios({ isReference: true, publishingModel: 'locale-based' });
    });
  });

  describe('When entity is NOT a reference (isReference: false)', () => {
    describe('Entry-based publishing', () => {
      testPublishingScenarios({ isReference: false, publishingModel: 'entry-based' });
    });

    describe('Locale-based publishing', () => {
      testPublishingScenarios({ isReference: false, publishingModel: 'locale-based' });
    });
  });
});
