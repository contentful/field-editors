import { useEffect, useState } from 'react';

import { ContentType, FieldAppSDK } from '@contentful/app-sdk';

type SDKWithCMA = Pick<FieldAppSDK, 'cma'>;
type CMAClient = SDKWithCMA['cma'];

export function useContentTypes(source: SDKWithCMA | CMAClient): ContentType[] {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  // Handle both SDK object with cma property or plain CMA client
  const cma = 'cma' in source ? source.cma : source;

  useEffect(() => {
    cma.contentType.getMany({}).then((response) => {
      setContentTypes(response.items);
    });
  }, [cma]);

  return contentTypes;
}
