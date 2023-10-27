import AppSDK from '@contentful/app-sdk';
//@ts-expect-error
const { BaseAppSDK, ContentType, ContentTypeField, Link, Entry, Asset } = AppSDK;

export { BaseAppSDK, ContentType, ContentTypeField, Link, Entry, Asset };

export interface File {
  fileName: string;
  contentType: string;
  upload?: string;
  url?: string;
  details?: Record<string, any>;
  uploadFrom?: Record<string, any>;
}
