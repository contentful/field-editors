import { useEffect, useState } from 'react';

import { ContentType, FieldAppSDK } from '@contentful/app-sdk';

type SDKWithCMA = Pick<FieldAppSDK, 'cma'>;
type CMAClient = SDKWithCMA['cma'];

export function useContentTypes(source: SDKWithCMA | CMAClient): ContentType[] {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  const cma = 'cma' in source ? source.cma : source;

  useEffect(() => {
    let isMounted = true;

    const fetchAllContentTypes = async () => {
      try {
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

        if (isMounted) {
          setContentTypes(allContentTypes);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch content types:', error);
        }
      }
    };

    fetchAllContentTypes();

    return () => {
      isMounted = false;
    };
  }, [cma]);

  return contentTypes;
}
