export {
  BaseExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  Entry,
  Asset,
} from '@contentful/app-sdk';

export interface File {
  fileName: string;
  contentType: string;
  upload?: string;
  url?: string;
  details?: Record<string, any>;
  uploadFrom?: Record<string, any>;
}
