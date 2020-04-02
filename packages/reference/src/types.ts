import { NavigatorSlideInfo } from 'contentful-ui-extensions-sdk';
import { Entry, Asset, ReferenceEntityType } from '@contentful/field-editor-shared';

export {
  BaseExtensionSDK,
  FieldExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  EntityType
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

export type Action =
  | {
      type: 'create_and_link';
      entity: ReferenceEntityType;
      entityData: Entry | Asset;
      slide?: NavigatorSlideInfo;
    }
  | { type: 'select_and_link'; entity: ReferenceEntityType; entityData: Entry | Asset }
  | {
      type: 'edit';
      contentTypeId: string;
      id: string;
      entity: ReferenceEntityType;
      slide?: NavigatorSlideInfo;
    }
  | { type: 'delete'; contentTypeId: string; id: string; entity: ReferenceEntityType }
  | { type: 'rendered'; entity: ReferenceEntityType };
