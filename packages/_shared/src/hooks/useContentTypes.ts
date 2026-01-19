import { useEffect } from 'react';

import { ContentType, FieldAppSDK } from '@contentful/app-sdk';

import { useQuery, useQueryClient } from '../queryClient';

type SDKWithCMA = Pick<FieldAppSDK, 'cma'>;
type SDKWithCMAAndNavigator = Pick<FieldAppSDK, 'cma' | 'navigator'>;
type CMAClient = SDKWithCMA['cma'];

const CONTENT_TYPES_QUERY_KEY = ['contentTypes'];

export type UseContentTypesResult = {
  contentTypes: ContentType[];
  invalidate: () => void;
};

export function useContentTypes(
  source: SDKWithCMAAndNavigator | SDKWithCMA | CMAClient,
): UseContentTypesResult {
  const cma = 'cma' in source ? source.cma : source;
  const navigator = 'navigator' in source ? source.navigator : undefined;
  const queryClient = useQueryClient();

  const { data: contentTypes = [] } = useQuery(
    CONTENT_TYPES_QUERY_KEY,
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
        void queryClient.invalidateQueries(CONTENT_TYPES_QUERY_KEY);
      }
    });

    return unsubscribe as () => void;
  }, [navigator, queryClient]);

  const invalidate = () => {
    return queryClient.invalidateQueries(CONTENT_TYPES_QUERY_KEY);
  };

  return { contentTypes, invalidate };
}
