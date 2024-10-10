import { renderHook } from '@testing-library/react-hooks';

import { useAsyncLocalePublishStatus } from './useAsyncLocalePublishStatus';

describe('useAsyncLocalePublishStatus', () => {
  const enUS = {
    code: 'en-US',
    name: 'en-US',
    internal_code: 'en-US',
    fallbackCode: null,
    default: false,
    contentManagementApi: true,
    contentDeliveryApi: true,
    optional: false,
    sys: {
      type: 'Locale',
      id: 'en-US',
      version: 1,
      space: { sys: { type: 'Link', linkType: 'Space', id: 'test-xokbvvklfw' } },
      environment: { sys: { type: 'Link', linkType: 'Environment', id: 'test-ak19mszr76' } },
      createdBy: { sys: { type: 'Link', linkType: 'User', id: 'test-0olok52c12' } },
      createdAt: '2017-01-23T10:17:55Z',
      updatedBy: { sys: { type: 'Link', linkType: 'User', id: 'test-0olok52c12' } },
      updatedAt: '2017-01-23T10:17:55Z',
    },
  };
  const deDE = {
    code: 'de-DE',
    name: 'de-DE',
    internal_code: 'de-DE',
    fallbackCode: null,
    default: false,
    contentManagementApi: true,
    contentDeliveryApi: true,
    optional: false,
    sys: {
      type: 'Locale',
      id: 'de-DE',
      version: 1,
      space: { sys: { type: 'Link', linkType: 'Space', id: 'test-tnw0g6rujf' } },
      environment: { sys: { type: 'Link', linkType: 'Environment', id: 'test-wisyjo6pk4' } },
      createdBy: { sys: { type: 'Link', linkType: 'User', id: 'test-j63uqcmqlx' } },
      createdAt: '2017-01-23T10:17:55Z',
      updatedBy: { sys: { type: 'Link', linkType: 'User', id: 'test-j63uqcmqlx' } },
      updatedAt: '2017-01-23T10:17:55Z',
    },
  };
  const esES = {
    code: 'es-ES',
    name: 'es-ES',
    internal_code: 'es-ES',
    fallbackCode: null,
    default: false,
    contentManagementApi: true,
    contentDeliveryApi: true,
    optional: false,
    sys: {
      type: 'Locale',
      id: 'es-ES',
      version: 1,
      space: { sys: { type: 'Link', linkType: 'Space', id: 'test-h0e5p83kvo' } },
      environment: { sys: { type: 'Link', linkType: 'Environment', id: 'test-extqkvjiub' } },
      createdBy: { sys: { type: 'Link', linkType: 'User', id: 'test-1xpsnz99fa' } },
      createdAt: '2017-01-23T10:17:55Z',
      updatedBy: { sys: { type: 'Link', linkType: 'User', id: 'test-1xpsnz99fa' } },
      updatedAt: '2017-01-23T10:17:55Z',
    },
  };

  describe('status from entity', () => {
    it('returns the status from an entry', () => {
      const entity = {
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
          automationTags: [],
        },
        fields: {},
      };

      const { result } = renderHook(() => useAsyncLocalePublishStatus(entity, [enUS, deDE, esES]));

      expect(result.current).toEqual(
        new Map([
          ['en-US', { status: 'published', locale: enUS }],
          ['de-DE', { status: 'changed', locale: deDE }],
          ['es-ES', { status: 'draft', locale: esES }],
        ])
      );
    });

    it('returns the status from an asset', () => {
      const entity = {
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

      const { result } = renderHook(() => useAsyncLocalePublishStatus(entity, [enUS, deDE, esES]));

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

      const { result } = renderHook(() => useAsyncLocalePublishStatus(entity, [enUS, deDE, esES]));

      expect(result.current).toEqual(
        new Map([
          ['en-US', { status: 'published', locale: enUS }],
          ['de-DE', { status: 'published', locale: deDE }],
          ['es-ES', { status: 'published', locale: esES }],
        ])
      );
    });

    it('returns undefined as publishStatus if there is no entity provided', () => {
      const { result } = renderHook(() =>
        useAsyncLocalePublishStatus(undefined, [enUS, deDE, esES])
      );

      expect(result.current).toBeUndefined();
    });
  });
});
