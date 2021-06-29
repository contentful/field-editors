import * as React from 'react';
import constate from 'constate';
import { FieldExtensionSDK } from '@contentful/field-editor-reference/dist/types';

interface SdkProviderProps {
  sdk: FieldExtensionSDK;
}

function useSdk({ sdk }: SdkProviderProps) {
  const sdkMemo = React.useMemo<FieldExtensionSDK>(() => sdk, []); // eslint-disable-line

  return sdkMemo;
}

export const [SdkProvider, useSdkContext] = constate(useSdk);
