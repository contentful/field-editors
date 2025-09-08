import { renderHook } from '@testing-library/react';
import type { AssetProps, CollectionProp, EntryProps, LocaleProps } from 'contentful-management';

import type { ReleaseV2Entity, ReleaseV2EntityWithLocales, ReleaseV2Props } from '../types';
import { getPreviousReleaseEntity } from '../utils/getPreviousReleaseEntity';
import { useActiveReleaseLocalesStatuses } from './useActiveReleaseLocalesStatuses';

const buildEntry = (status: 'draft' | 'published' | 'changed') =>
  ({
    sys: {
      fieldStatus: {
        '*': { 'en-US': status },
      },
    },
  }) as unknown as EntryProps;

const buildAsset = (status: 'draft' | 'published' | 'changed') =>
  ({
    sys: {
      fieldStatus: {
        '*': { 'en-US': status },
      },
    },
  }) as unknown as AssetProps;

const createEntryBasedReleaseEntity = ({
  entityId = 'entry-1',
  action = 'publish',
  entityType = 'Entry',
}: {
  entityId?: string;
  action?: 'publish' | 'unpublish';
  entityType?: 'Entry' | 'Asset';
}) =>
  ({
    entity: {
      sys: { type: 'Link', linkType: entityType, id: entityId },
    },
    action,
  }) as ReleaseV2Entity;

const createEntryBasedRelease = ({
  entityId,
  action,
  entityType = 'Entry',
}: { entityId?: string; action?: 'publish' | 'unpublish'; entityType?: 'Entry' | 'Asset' } = {}) =>
  ({
    title: 'Release 1',
    sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v2' },
    entities: { items: [createEntryBasedReleaseEntity({ entityId, action, entityType })] },
  }) as ReleaseV2Props;

const createLocaleBasedReleaseEntity = ({
  entityId = 'entry-1',
  verb = 'add',
  entityType = 'Entry',
}: {
  entityId?: string;
  verb?: 'add' | 'remove';
  entityType?: 'Entry' | 'Asset';
}) =>
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
  entityType = 'Entry',
}: { entityId?: string; verb?: 'add' | 'remove'; entityType?: 'Entry' | 'Asset' } = {}) =>
  ({
    title: 'Release 1',
    sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v2' },
    entities: { items: [createLocaleBasedReleaseEntity({ entityId, verb, entityType })] },
  }) as ReleaseV2Props;

jest.mock('../utils/getPreviousReleaseEntity', () => ({
  getPreviousReleaseEntity: jest.fn(),
}));

const ENTITY_TYPES = ['Entry', 'Asset'] as const;

describe('useActiveReleaseLocalesStatuses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  ENTITY_TYPES.forEach((entityType) => {
    const entityId = entityType === 'Entry' ? 'entry-1' : 'asset-1';
    const baseParams = {
      entityId,
      locales: [{ code: 'en-US' } as LocaleProps],
      isActiveReleaseLoading: false,
      releaseVersionMap: new Map(),
      releases: { items: [] } as unknown as CollectionProp<ReleaseV2Props>,
    };
    describe(`${entityType} with entry based publishing`, () => {
      it('returns Will publish status when active release has publish action', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: createEntryBasedReleaseEntity({
            entityId,
            action: 'unpublish',
            entityType,
          }),
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createEntryBasedRelease({
              entityId,
              entityType,
            }),
            currentEntityDraft: entityType === 'Entry' ? buildEntry('draft') : buildAsset('draft'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'positive',
          status: 'willPublish',
          label: 'Will publish',
          locale: { code: 'en-US' },
        });
      });

      it('returns Becomes draft status when previous version has published locales and active version has unpublish action', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: createEntryBasedReleaseEntity({
            entityId,
            action: 'publish',
            entityType,
          }),
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createEntryBasedRelease({ action: 'unpublish', entityId, entityType }),
            currentEntityDraft:
              entityType === 'Entry' ? buildEntry('published') : buildAsset('published'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'warning',
          status: 'becomesDraft',
          label: 'Becomes draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns Remains draft status when previous version has draft locales and active version has unpublish action', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: createEntryBasedReleaseEntity({
            action: 'unpublish',
            entityType,
            entityId,
          }),
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createEntryBasedRelease({ action: 'unpublish', entityId, entityType }),
            currentEntityDraft: entityType === 'Entry' ? buildEntry('draft') : buildAsset('draft'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'secondary',
          status: 'remainsDraft',
          label: 'Remains draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns Not in release status when entity is not in the release', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: undefined,
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createEntryBasedRelease({
              entityId: entityType === 'Entry' ? 'entry-2' : 'asset-2',
              action: 'publish',
              entityType,
            }),
            currentEntityDraft: entityType === 'Entry' ? buildEntry('draft') : buildAsset('draft'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
      });
    });
    describe(`${entityType} with locale based publishing`, () => {
      it('returns Will publish status when active release has publish action', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: createLocaleBasedReleaseEntity({
            entityId,
            verb: 'remove',
            entityType,
          }),
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createLocaleBasedRelease({ entityId, entityType }),
            currentEntityDraft: entityType === 'Entry' ? buildEntry('draft') : buildAsset('draft'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'positive',
          status: 'willPublish',
          label: 'Will publish',
          locale: { code: 'en-US' },
        });
      });

      it('returns Becomes draft status when previous version has published locales and active version has unpublish action', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: createLocaleBasedReleaseEntity({
            entityId: 'entry-1',
            verb: 'add',
            entityType,
          }),
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createLocaleBasedRelease({ verb: 'remove', entityId, entityType }),
            currentEntityDraft:
              entityType === 'Entry' ? buildEntry('published') : buildAsset('published'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'warning',
          status: 'becomesDraft',
          label: 'Becomes draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns Remains draft status when previous version has draft locales and active version has unpublish action', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: createLocaleBasedReleaseEntity({
            verb: 'remove',
            entityId,
            entityType,
          }),
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createLocaleBasedRelease({ verb: 'remove', entityId, entityType }),
            currentEntityDraft: entityType === 'Entry' ? buildEntry('draft') : buildAsset('draft'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'secondary',
          status: 'remainsDraft',
          label: 'Remains draft',
          locale: { code: 'en-US' },
        });
      });

      it('returns Not in release status when entry is not in the release', () => {
        (getPreviousReleaseEntity as jest.Mock).mockReturnValue({
          previousReleaseEntity: undefined,
        });

        const { result } = renderHook(() =>
          useActiveReleaseLocalesStatuses({
            ...baseParams,
            activeRelease: createLocaleBasedRelease({
              entityId: entityType === 'Entry' ? 'entry-2' : 'asset-2',
              entityType,
              verb: 'add',
            }),
            currentEntityDraft: entityType === 'Entry' ? buildEntry('draft') : buildAsset('draft'),
          }),
        );

        expect(result.current.releaseLocalesStatusMap.get('en-US')).toEqual({
          variant: 'secondary',
          status: 'notInRelease',
          label: 'Not in release',
          locale: { code: 'en-US' },
        });
      });
    });
  });
});
