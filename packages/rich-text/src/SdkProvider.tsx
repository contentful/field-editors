import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import constate from 'constate';

interface SdkProviderProps {
  sdk: FieldExtensionSDK;
}

function useSdk({ sdk }: SdkProviderProps) {
  const sdkMemo = React.useMemo<FieldExtensionSDK>(() => sdk, []); // eslint-disable-line

  return sdkMemo;
}

export const [SdkProvider, useSdkContext] = constate(useSdk);
