import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import constate from 'constate';

interface SdkProviderProps {
  sdk: FieldExtensionSDK & {
    field: {
      comments: {
        open: (commentId: string) => void;
        get: any[];
        create: () => void;
        update: (commentId: string, comment: any) => void;
        delete: (commentId: string) => void;
      };
    };
  };
}

function useSdk({ sdk }: SdkProviderProps) {
  const sdkMemo = React.useMemo<
    FieldExtensionSDK & {
      field: {
        comments: {
          open: (commentId: string) => void;
          get: any[];
          create: () => void;
          update: (commentId: string, comment: any) => void;
          delete: (commentId: string) => void;
        };
      };
    }
  >(() => sdk, []); // eslint-disable-line -- TODO: explain this disable

  return sdkMemo;
}

export const [SdkProvider, useSdkContext] = constate(useSdk);
