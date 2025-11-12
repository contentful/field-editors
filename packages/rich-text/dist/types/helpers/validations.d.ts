import { FieldAppSDK } from '@contentful/app-sdk';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
export declare const VALIDATIONS: {
    ENABLED_MARKS: string;
    ENABLED_NODE_TYPES: string;
};
export declare const DEFAULT_ENABLED_NODE_TYPES: string[];
export declare const VALIDATABLE_NODE_TYPES: (INLINES | BLOCKS)[];
export declare const isNodeTypeEnabled: (field: FieldAppSDK['field'], nodeType: any) => boolean;
export declare const isMarkEnabled: (field: FieldAppSDK['field'], mark: any) => boolean;
