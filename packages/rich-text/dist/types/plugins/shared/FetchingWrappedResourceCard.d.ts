import * as React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { ResourceLink } from '@contentful/rich-text-types';
interface FetchingWrappedResourceCardProps {
    link: ResourceLink['sys'];
    isDisabled: boolean;
    isSelected: boolean;
    sdk: FieldAppSDK;
    onEntityFetchComplete?: VoidFunction;
    onEdit?: VoidFunction;
    onRemove?: VoidFunction;
}
export declare const FetchingWrappedResourceCard: (props: FetchingWrappedResourceCardProps) => React.JSX.Element;
export {};
