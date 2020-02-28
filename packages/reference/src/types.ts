import { EntrySys } from 'contentful-ui-extensions-sdk';
import { File } from '@contentful/field-editor-shared';

export {
  BaseExtensionSDK,
  ContentType,
  ContentTypeField,
  Link
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

export type Asset = {
  sys: EntrySys;
  fields: {
    title: {
      [locale: string]: string;
    };
    file: {
      [locale: string]: File;
    };
  };
};
