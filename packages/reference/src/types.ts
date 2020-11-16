import { NavigatorSlideInfo, EntityType } from 'contentful-ui-extensions-sdk';
import { Entry, Asset } from '@contentful/field-editor-shared';

export {
  BaseExtensionSDK,
  FieldExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  EntityType,
  NavigatorSlideInfo,
} from 'contentful-ui-extensions-sdk';

export { Entry, File, Asset } from '@contentful/field-editor-shared';

export type ReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: EntityType;
  };
};

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
      entity: EntityType;
      entityData: Entry | Asset;
      slide?: NavigatorSlideInfo;
      index?: number;
    }
  | { type: 'select_and_link'; entity: EntityType; entityData: Entry | Asset; index?: number }
  | {
      type: 'edit';
      contentTypeId: string;
      id: string;
      entity: EntityType;
      slide?: NavigatorSlideInfo;
    }
  | { type: 'delete'; contentTypeId: string; id: string; entity: EntityType }
  | { type: 'rendered'; entity: EntityType };

export type ActionLabels = {
  createNew: (props?: { contentType?: string }) => string;
  linkExisting: (props?: { canLinkMultiple?: boolean }) => string;
};
