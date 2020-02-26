import { EntrySys } from 'contentful-ui-extensions-sdk';

export {
  BaseExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  EntrySys
} from 'contentful-ui-extensions-sdk';

export type ViewType = 'card' | 'link';

export type EntityType = 'entry' | 'asset';

export type SingleReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: 'Entry';
  };
};

export interface Entry {
  sys: EntrySys;
  fields: {
    [key: string]: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [localeKey: string]: any;
    };
  };
}

export interface File {
  url: string;
  fileName: string;
  contentType: string;
  details: { size: number; image: { width: number; height: number } };
}
