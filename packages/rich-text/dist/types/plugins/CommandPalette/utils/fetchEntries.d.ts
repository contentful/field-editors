import type { FieldAppSDK } from '@contentful/app-sdk';
import type { ContentTypeProps } from 'contentful-management/types';
export declare function fetchEntries(sdk: FieldAppSDK, contentType: ContentTypeProps, query: string): Promise<{
    contentTypeName: string;
    displayTitle: string;
    id: string;
    description: string;
    entry: import("@contentful/app-sdk").Entry<import("contentful-management/types").KeyValueMap>;
}[]>;
