import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import constate from 'constate';

interface SdkProviderProps {
  sdk: FieldAppSDK;
}

function useSdk({ sdk }: SdkProviderProps) {
  /* eslint-disable -- TODO: explain this disable */
  const sdkMemo = React.useMemo<FieldAppSDK>(
    () => sdk,
    [sdk.parameters.instance.release, sdk.field.validations],
  );
  /* eslint-enable */

  return sdkMemo;
}

export const [SdkProvider, useSdkContext] = constate(useSdk);
