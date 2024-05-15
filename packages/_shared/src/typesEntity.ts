export { BaseAppSDK, ContentType, ContentTypeField, Link, Entry, Asset } from '@contentful/app-sdk';
export { LocaleProps } from 'contentful-management';

export interface File {
  fileName: string;
  contentType: string;
  upload?: string;
  url?: string;
  details?: Record<string, any>;
  uploadFrom?: Record<string, any>;
}
