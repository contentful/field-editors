import { FieldAppSDK, Link } from '@contentful/app-sdk';
import { renderHook } from '@testing-library/react-hooks';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useEntityInfo } from './useEntityInfo';

vi.mock('./utils', () => ({ getEntityInfo: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

describe.each(['Entry', 'Asset'] as const)('%s hyperlink information', (linkType) => {
  test.each([undefined, null, {}, { sys: undefined }, { sys: null }])(
    'shows an inaccessible state when fetched metadata is missing (%j)',
    async (entity) => {
      vi.spyOn(console, 'log').mockImplementation(() => undefined);
      const get = vi.fn().mockResolvedValue(entity);
      const sdk = {
        cma: { entry: { get }, asset: { get } },
        field: { locale: 'en-US' },
        locales: { default: 'en-US' }
      } as unknown as FieldAppSDK;
      const target: Link<'Entry' | 'Asset'> = {
        sys: { type: 'Link', id: 'linked-id', linkType }
      };
      const onEntityFetchComplete = vi.fn();
      const { result, waitFor } = renderHook(() =>
        useEntityInfo({ sdk, target, onEntityFetchComplete })
      );

      await waitFor(() => {
        expect(result.current).toBe(`${linkType} missing or inaccessible`);
      });

      expect(result.error).toBeUndefined();
      expect(onEntityFetchComplete).toHaveBeenCalledOnce();
    }
  );
});
