import { Asset, ContentEntityType, Entry, FieldAppSDK, Link, ScheduledAction } from '@contentful/app-sdk';
import { entityHelpers } from '@contentful/field-editor-shared';
export type FetchedEntityData = {
    jobs: ScheduledAction[];
    entity: Entry | Asset;
    entityTitle: string;
    entityDescription: string;
    entityStatus: ReturnType<typeof entityHelpers.getEntityStatus>;
    contentTypeName: string;
};
export type EntityInfoProps = {
    target: Link<ContentEntityType>;
    sdk: FieldAppSDK;
    onEntityFetchComplete?: VoidFunction;
};
export declare function useEntityInfo(props: EntityInfoProps): string;
