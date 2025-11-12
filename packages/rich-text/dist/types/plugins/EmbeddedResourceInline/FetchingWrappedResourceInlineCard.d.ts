import * as React from 'react';
import { ResourceLink } from '@contentful/field-editor-reference';
import { FieldAppSDK } from '@contentful/field-editor-shared';
interface FetchingWrappedResourceInlineCardProps {
    link: ResourceLink<'Contentful:Entry'>['sys'];
    sdk: FieldAppSDK;
    isSelected: boolean;
    isDisabled: boolean;
    onRemove: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onEntityFetchComplete?: VoidFunction;
}
export declare function FetchingWrappedResourceInlineCard(props: FetchingWrappedResourceInlineCardProps): React.JSX.Element;
export {};
