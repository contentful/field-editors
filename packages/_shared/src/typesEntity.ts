import { EntrySys } from '@contentful/app-sdk';

export {
  BaseExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  EntrySys,
} from '@contentful/app-sdk';

export interface Entry {
  sys: EntrySys;
  fields: {
    [key: string]: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [localeKey: string]: any;
    };
  };
}

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

export interface File {
  url: string;
  fileName: string;
  contentType: string;
  details: { size: number; image: { width: number; height: number } };
}
