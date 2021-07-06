import { ContentEntitySys as EntrySys } from '@contentful/app-sdk';

export { BaseExtensionSDK, ContentType, ContentTypeField, Link } from '@contentful/app-sdk';
export { EntrySys };

export interface Entry {
  sys: EntrySys;
  fields: {
    [key: string]: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [localeKey: string]: any;
    };
  };
  metadata: {
    tags: [];
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
  metadata: {
    tags: [];
  };
};

export interface File {
  url: string;
  fileName: string;
  contentType: string;
  details: { size: number; image: { width: number; height: number } };
}
