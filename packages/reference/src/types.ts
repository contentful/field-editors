import { NavigatorSlideInfo, ContentEntityType } from '@contentful/app-sdk';
import { Entry, Asset } from '@contentful/field-editor-shared';

export type {
  BaseExtensionSDK,
  FieldExtensionSDK,
  ContentType,
  ContentTypeField,
  Link,
  ContentEntityType,
  NavigatorSlideInfo,
  ScheduledAction,
} from '@contentful/app-sdk';
export type { SpaceProps as Space } from 'contentful-management';

export { Entry, File, Asset } from '@contentful/field-editor-shared';

export type { ResourceInfo } from './common/EntityStore';

export type Entity = Entry | Asset;

export type EntryLink = { sys: { type: 'Link'; linkType: 'Entry'; id: string } };

export type AssetLink = { sys: { type: 'Link'; linkType: 'Asset'; id: string } };

export type EntityLink = EntryLink | AssetLink;

export type ResourceType = 'Contentful:Entry';

export type Resource = Entry | Asset;

export type EntityType = 'Entry' | 'Asset' | ResourceType;

export type SysResourceLink<T extends string> = {
  sys: { type: 'ResourceLink'; linkType: T; urn: string };
};
export type ContentfulEntryLink = SysResourceLink<'Contentful:Entry'>;
export type ResourceLink = ContentfulEntryLink;

/**
 * @deprecated use `EntityLink` type
 */
export type ReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: ContentEntityType;
  };
};

/**
 * @deprecated use `EntryLink` type
 */
export type EntryReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: 'Entry';
  };
};

/**
 * @deprecated use `AssetLink` type
 */
export type AssetReferenceValue = {
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
