import { renderHook } from '@testing-library/react';
import type { CollectionProp, EntryProps, LocaleProps } from 'contentful-management';

import type { ReleaseV2Entity, ReleaseV2EntityWithLocales, ReleaseV2Props } from '../types';
import { getPreviousReleaseEntryVersion } from '../utils/getPreviousReleaseEntryVersion';
import { useActiveReleaseLocalesStatuses } from './useActiveReleaseLocalesStatuses';

const buildEntry = (status: 'draft' | 'published' | 'changed') =>
  ({
    sys: {
      fieldStatus: {
        '*': { 'en-US': status },
      },
    },
  }) as unknown as EntryProps;

const createEntryBasedReleaseEntity = ({
  entryId = 'entry-1',
  action = 'publish',
}: {
  entryId?: string;
  action?: 'publish' | 'unpublish';
}) =>
  ({
    entity: {
      sys: { type: 'Link', linkType: 'Entry', id: entryId },
    },
    action,
  }) as ReleaseV2Entity;

const createEntryBasedRelease = ({
  entryId,
  action,
}: { entryId?: string; action?: 'publish' | 'unpublish' } = {}) =>
  ({
    title: 'Release 1',
    sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v2' },
    entities: { items: [createEntryBasedReleaseEntity({ entryId, action })] },
  }) as ReleaseV2Props;

const createLocaleBasedReleaseEntity = ({
  entryId = 'entry-1',
  verb = 'add',
}: {
  entryId?: string;
  verb?: 'add' | 'remove';
}) =>
  ({
    entity: {
      sys: { type: 'Link', linkType: 'Entry', id: entryId },
    },
    [verb]: {
      fields: { '*': ['en-US'] },
    },
  }) as ReleaseV2EntityWithLocales;

const createLocaleBasedRelease = ({
  entryId,
  verb,
}: { entryId?: string; verb?: 'add' | 'remove' } = {}) =>
  ({
    title: 'Release 1',
    sys: { id: 'release-1', type: 'Release', schemaVersion: 'Release.v2' },
    entities: { items: [createLocaleBasedReleaseEntity({ entryId, verb })] },
  }) as ReleaseV2Props;

jest.mock('../utils/getPreviousReleaseEntryVersion', () => ({
  getPreviousReleaseEntryVersion: jest.fn(),
}));

const baseParams = {
  entryId: 'entry-1',
  locales: [{ code: 'en-US' } as LocaleProps],
  isActiveReleaseLoading: false,
  releaseVersionMap: new Map(),
  releases: { items: [] } as unknown as CollectionProp<ReleaseV2Props>,
};

describe('useActiveReleaseLocalesStatuses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with entry based publishing', () => {
    it('returns Will publish status when active release has publish action', () => {
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: createEntryBasedReleaseEntity({
          entryId: 'entry-1',
          action: 'unpublish',
        }),
        previousEntryVersion: {
          sys: {
            fieldStatus: { '*': { 'en-US': 'draft' } },
          },
        },
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createEntryBasedRelease(),
          currentEntryDraft: buildEntry('draft'),
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
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: createEntryBasedReleaseEntity({
          entryId: 'entry-1',
          action: 'publish',
        }),
        previousEntryVersion: {
          sys: {
            fieldStatus: { '*': { 'en-US': 'published' } },
          },
        },
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createEntryBasedRelease({ action: 'unpublish' }),
          currentEntryDraft: buildEntry('published'),
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
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: createEntryBasedReleaseEntity({ action: 'unpublish' }),
        previousEntryVersion: {
          sys: {
            fieldStatus: { '*': { 'en-US': 'draft' } },
          },
        },
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createEntryBasedRelease({ action: 'unpublish' }),
          currentEntryDraft: buildEntry('draft'),
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
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: undefined,
        previousEntryVersion: undefined,
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createEntryBasedRelease({
            entryId: 'entry-2',
            action: 'publish',
          }),
          currentEntryDraft: buildEntry('draft'),
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

  describe('with locale based publishing', () => {
    it('returns Will publish status when active release has publish action', () => {
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: createLocaleBasedReleaseEntity({
          entryId: 'entry-1',
          verb: 'remove',
        }),
        previousEntryVersion: {
          sys: {
            fieldStatus: { '*': { 'en-US': 'draft' } },
          },
        },
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createLocaleBasedRelease(),
          currentEntryDraft: buildEntry('draft'),
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
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: createLocaleBasedReleaseEntity({
          entryId: 'entry-1',
          verb: 'add',
        }),
        previousEntryVersion: {
          sys: {
            fieldStatus: { '*': { 'en-US': 'published' } },
          },
        },
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createLocaleBasedRelease({ verb: 'remove' }),
          currentEntryDraft: buildEntry('published'),
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
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: createLocaleBasedReleaseEntity({ verb: 'remove' }),
        previousEntryVersion: {
          sys: {
            fieldStatus: { '*': { 'en-US': 'draft' } },
          },
        },
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createLocaleBasedRelease({ verb: 'remove' }),
          currentEntryDraft: buildEntry('draft'),
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
      (getPreviousReleaseEntryVersion as jest.Mock).mockReturnValue({
        previousReleaseEntity: undefined,
        previousEntryVersion: undefined,
      });

      const { result } = renderHook(() =>
        useActiveReleaseLocalesStatuses({
          ...baseParams,
          activeRelease: createLocaleBasedRelease({
            entryId: 'entry-2',
            verb: 'add',
          }),
          currentEntryDraft: buildEntry('draft'),
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
