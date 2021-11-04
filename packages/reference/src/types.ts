import { NavigatorSlideInfo, ContentEntityType } from '@contentful/app-sdk';
import { Entry, Asset } from '@contentful/field-editor-shared';

export {
  BaseExtensionSDK,
  FieldExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  ContentEntityType,
  NavigatorSlideInfo,
  ScheduledAction,
} from '@contentful/app-sdk';

export { Entry, File, Asset } from '@contentful/field-editor-shared';

export type ReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: ContentEntityType;
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
      entity: ContentEntityType;
      entityData: Entry | Asset;
      slide?: NavigatorSlideInfo;
      index?: number;
    }
  | {
      type: 'select_and_link';
      entity: ContentEntityType;
      entityData: Entry | Asset;
      index?: number;
    }
  | {
      type: 'edit';
      contentTypeId: string;
      id: string;
      entity: ContentEntityType;
      slide?: NavigatorSlideInfo;
    }
  | { type: 'delete'; contentTypeId: string; id: string; entity: ContentEntityType }
  | { type: 'rendered'; entity: ContentEntityType };

export type ActionLabels = {
  createNew: (props?: { contentType?: string }) => string;
  linkExisting: (props?: { canLinkMultiple?: boolean }) => string;
};

export type RenderDragFn = (props: {
  drag: React.ReactElement;
  isDragging?: boolean;
}) => React.ReactElement;
