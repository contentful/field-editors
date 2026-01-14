import { useEffect, useState } from 'react';

import { ContentType, FieldAppSDK } from '@contentful/app-sdk';

type SDKWithCMA = Pick<FieldAppSDK, 'cma'>;

export function useContentTypes(sdk: SDKWithCMA): ContentType[] {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  useEffect(() => {
    sdk.cma.contentType.getMany({}).then((response) => {
      setContentTypes(response.items);
    });
  }, [sdk.cma]);

  return contentTypes;
}
