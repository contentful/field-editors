import { FieldAppSDK } from '@contentful/app-sdk';
export declare function fetchAssets(sdk: FieldAppSDK, query: string): Promise<{
    contentTypeName: string;
    displayTitle: string;
    id: string;
    entity: import("@contentful/app-sdk").Asset;
    thumbnail: string;
}[]>;
