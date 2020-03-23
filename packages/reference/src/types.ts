export {
  BaseExtensionSDK,
  FieldExtensionSDK,
  ContentType,
  ContentTypeField,
  Link
} from 'contentful-ui-extensions-sdk';

export { ReferenceEntityType, Entry, File, Asset } from '@contentful/field-editor-shared';

export type EntryReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: 'Entry';
  };
};

export declare type AssetReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: 'Asset';
  };
};

export type ViewType = 'card' | 'link';
