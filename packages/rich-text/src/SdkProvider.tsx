import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import constate from 'constate';

interface SdkProviderProps {
  sdk: FieldAppSDK;
}

function useSdk({ sdk }: SdkProviderProps) {
  const sdkMemo = React.useMemo<FieldAppSDK>(() => sdk, []); // eslint-disable-line -- TODO: explain this disable

  return sdkMemo;
}

export const [SdkProvider, useSdkContext] = constate(useSdk);
