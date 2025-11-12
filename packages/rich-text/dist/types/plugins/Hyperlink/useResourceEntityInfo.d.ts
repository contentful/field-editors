import { ResourceLink } from '@contentful/rich-text-types';
type ResourceEntityInfoProps = {
    target: ResourceLink;
    onEntityFetchComplete?: VoidFunction;
};
export declare function useResourceEntityInfo({ onEntityFetchComplete, target }: ResourceEntityInfoProps): string;
export {};
