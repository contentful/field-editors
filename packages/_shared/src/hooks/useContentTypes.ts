import { useEffect, useMemo } from 'react';

import { ContentType, FieldAppSDK } from '@contentful/app-sdk';

import { useQuery, useQueryClient } from '../queryClient';
import { createGetContentTypeKey, createGetManyContentTypesKey } from '../queryKeys';

type SDKWithCMA = Pick<FieldAppSDK, 'cma'>;
type SDKWithCMAAndNavigator = Pick<FieldAppSDK, 'cma' | 'navigator'>;
type SDKWithIdsAndCMA = Pick<FieldAppSDK, 'cma' | 'ids'>;
type CMAClient = SDKWithCMA['cma'];

/**
 * Hook to fetch a single content type by ID.
 * Uses proper query key for cache sharing with user_interface.
 */
export function useContentType(
  sdk: Pick<FieldAppSDK, 'cma' | 'ids'>,
  contentTypeId: string,
  options?: { enabled?: boolean },
) {
  const spaceId = sdk.ids.space;
  const environmentId = sdk.ids.environmentAlias ?? sdk.ids.environment;

  return useQuery(
    createGetContentTypeKey(spaceId, environmentId, contentTypeId),
    () => sdk.cma.contentType.get({ contentTypeId }),
    {
      staleTime: Infinity,
      ...options,
    },
  );
}

/**
 * Simple helper to fetch a single content type by ID.
 * For use in async functions or one-off fetches.
 * For repeated fetches with caching, use the useContentType hook instead.
 */
export async function fetchContentType(
  sdk: Pick<FieldAppSDK, 'cma'>,
  contentTypeId: string,
): Promise<ContentType> {
  return sdk.cma.contentType.get({ contentTypeId });
}

export type UseContentTypesResult = {
  contentTypes: ContentType[];
  invalidate: () => void;
};

export function useContentTypes(
  source: SDKWithCMAAndNavigator | SDKWithCMA | SDKWithIdsAndCMA | CMAClient,
): UseContentTypesResult {
  const cma = 'cma' in source ? source.cma : source;
  const navigator = 'navigator' in source ? source.navigator : undefined;
  const queryClient = useQueryClient();

  // Get space and environment IDs
  // The SDK should have ids when passed properly.
  // For CMA client directly, we expect empty strings (edge case).
  const spaceId = 'ids' in source ? source.ids.space : '';
  const environmentId =
    'ids' in source ? (source.ids.environmentAlias ?? source.ids.environment) : '';

  // Match the query parameters used in user_interface
  // Use useMemo to avoid re-creating the object on every render
  const queryParams = useMemo(() => ({ limit: 1000 }), []);

  const { data: contentTypes = [] } = useQuery(
    createGetManyContentTypesKey(spaceId, environmentId, queryParams),
    async () => {
      const allContentTypes: ContentType[] = [];
      const limit = 1000;
      let skip = 0;
      let total = 0;

      do {
        const response = await cma.contentType.getMany({ query: { limit, skip } });
        allContentTypes.push(...response.items);
        total = response.total;
        skip += response.items.length;
      } while (skip < total);

      return allContentTypes;
    },
    {
      staleTime: Infinity,
      refetchOnMount: false,
    },
  );

  // Auto-invalidate when returning from slide-in navigation (e.g., content model editor)
  useEffect(() => {
    if (!navigator?.onSlideInNavigation) {
      return;
    }

    const unsubscribe = navigator.onSlideInNavigation(({ oldSlideLevel, newSlideLevel }) => {
      // When closing a slide-in (going back), invalidate content types
      // This ensures the cache is refreshed if schema changes were made
      if (oldSlideLevel > newSlideLevel) {
        void queryClient.invalidateQueries(
          createGetManyContentTypesKey(spaceId, environmentId, queryParams),
        );
      }
    });

    return unsubscribe as () => void;
  }, [navigator, queryClient, spaceId, environmentId, queryParams]);

  const invalidate = () => {
    return queryClient.invalidateQueries(
      createGetManyContentTypesKey(spaceId, environmentId, queryParams),
    );
  };

  return { contentTypes, invalidate };
}
