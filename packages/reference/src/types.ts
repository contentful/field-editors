export {
  BaseExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  EntrySys
} from 'contentful-ui-extensions-sdk';

export {
  ReferenceEntityType,
  Entry,
  File,
  SingleReferenceValue
} from '@contentful/field-editor-shared';

export declare type SingleAssetReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: 'Asset';
  };
};

export type ViewType = 'card' | 'link';

export type Asset = any;
