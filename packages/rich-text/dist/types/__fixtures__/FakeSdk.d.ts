import { FieldAppSDK } from '@contentful/app-sdk';
import { Emitter } from 'mitt';
export type ReferenceEditorSdkProps = {
    initialValue?: any;
    validations?: any;
    fetchDelay?: number;
};
export declare function newReferenceEditorFakeSdk(props?: ReferenceEditorSdkProps): [FieldAppSDK, Emitter];
