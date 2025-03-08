import type { LocalesAPI } from '@contentful/app-sdk';
import { renderHook } from '@testing-library/react-hooks';
import { AssetProps } from 'contentful-management/types';

import { useLocalePublishStatus } from './useLocalePublishStatus';

describe('useLocalePublishStatus', () => {
  const enUS = { code: 'en-US', default: true, name: 'English (US)' };
  const deDE = { code: 'de-DE', default: false, name: 'German (Germany)' };
  const esES = { code: 'es-ES', default: false, name: 'Spanish (Spain)' };

  const localesAPI: LocalesAPI = {
    available: [enUS.code, deDE.code, esES.code],
    default: enUS.code,
    names: {
      [enUS.code]: enUS.name,
      [deDE.code]: deDE.name,
      [esES.code]: esES.name,
    },
    fallbacks: {},
    optional: {
      [enUS.code]: false,
      [deDE.code]: true,
      [esES.code]: true,
    },
    direction: {
      [enUS.code]: 'ltr',
      [deDE.code]: 'ltr',
      [esES.code]: 'ltr',
    },
  };

  describe('status from entity', () => {
    it('returns the status from an entry', () => {
      const entity: AssetProps = {
        metadata: { tags: [] },
        sys: {
          id: '1',
          type: 'Entry',
          createdAt: '2017-12-07T10:48:41Z',
          createdBy: { sys: { type: 'Link', linkType: 'User', id: 'test-u1dc0g7uzh' } },
          updatedAt: '2017-12-07T10:48:41Z',
          updatedBy: { sys: { type: 'Link', linkType: 'User', id: 'test-u1dc0g7uzh' } },
          space: { sys: { type: 'Link', linkType: 'Space', id: 'test-vllzslv98d' } },
          environment: { sys: { type: 'Link', linkType: 'Environment', id: 'test-y0ftcnn4eq' } },
          publishedCounter: 0,
          version: 1,
          fieldStatus: { '*': { 'en-US': 'published', 'de-DE': 'changed', 'es-ES': 'draft' } },
          contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'content-type' } },
        },
        fields: {
          title: {},
          file: {},
        },
      };

      const { result } = renderHook(() => useLocalePublishStatus(entity, localesAPI));

      expect(result.current).toEqual(
        new Map([
          ['en-US', { status: 'published', locale: enUS }],
          ['de-DE', { status: 'changed', locale: deDE }],
          ['es-ES', { status: 'draft', locale: esES }],
        ])
      );
    });

    it('returns the status from an asset', () => {
      const entity: AssetProps = {
        sys: {
          id: '2',
          type: 'Asset',
          version: 1,
          createdAt: '2017-12-07T10:48:41Z',
          createdBy: { sys: { type: 'Link', linkType: 'User', id: 'test-5im75v0tq3' } },
          updatedAt: '2017-12-07T10:48:41Z',
          updatedBy: { sys: { type: 'Link', linkType: 'User', id: 'test-5im75v0tq3' } },
          space: { sys: { type: 'Link', linkType: 'Space', id: 'test-xjlsyao0to' } },
          environment: { sys: { type: 'Link', linkType: 'Environment', id: 'test-cyscfldxt8' } },
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'contentful-builtin-asset-content-type',
            },
          },
          fieldStatus: { '*': { 'en-US': 'changed', 'de-DE': 'draft', 'es-ES': 'published' } },
        },
        fields: {
          title: { 'en-US': 'Title for id 2' },
          description: { 'en-US': 'Description for id 2' },
          file: { 'en-US': { fileName: '2.txt', contentType: 'text/plain' } },
        },
      };

      const { result } = renderHook(() => useLocalePublishStatus(entity, localesAPI));

      expect(result.current).toEqual(
        new Map([
          ['en-US', { status: 'changed', locale: enUS }],
          ['de-DE', { status: 'draft', locale: deDE }],
          ['es-ES', { status: 'published', locale: esES }],
        ])
      );
    });

    it('falls back to the entity status for entries if no fieldStatus is present', () => {
      const entity = {
        metadata: { tags: [] },
        sys: {
          id: '1',
          type: 'Entry',
          createdAt: '2017-12-07T10:48:41Z',
          createdBy: { sys: { type: 'Link', linkType: 'User', id: 'test-jm5uw542jo' } },
          updatedAt: '2017-12-07T10:48:41Z',
          updatedBy: { sys: { type: 'Link', linkType: 'User', id: 'test-jm5uw542jo' } },
          space: { sys: { type: 'Link', linkType: 'Space', id: 'test-tyjchr7iyp' } },
          environment: { sys: { type: 'Link', linkType: 'Environment', id: 'test-01ovjmre16' } },
          publishedCounter: 0,
          version: 1,
          contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'content-type' } },
          automationTags: [],
          publishedVersion: 1,
        },
        fields: {},
      };

      const { result } = renderHook(() => useLocalePublishStatus(entity, localesAPI));

      expect(result.current).toEqual(
        new Map([
          ['en-US', { status: 'published', locale: enUS }],
          ['de-DE', { status: 'published', locale: deDE }],
          ['es-ES', { status: 'published', locale: esES }],
        ])
      );
    });

    it('returns undefined as publishStatus if there is no entity provided', () => {
      const { result } = renderHook(() => useLocalePublishStatus(undefined, localesAPI));

      expect(result.current).toBeUndefined();
    });
  });
});
