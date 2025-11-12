import * as React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
interface SdkProviderProps {
    sdk: FieldAppSDK;
}
export declare const SdkProvider: React.FC<React.PropsWithChildren<SdkProviderProps>>, useSdkContext: () => FieldAppSDK;
export {};
