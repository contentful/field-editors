import * as React from 'react';
import { FieldAppSDK } from '@contentful/field-editor-shared';
interface FetchingWrappedInlineEntryCardProps {
    entryId: string;
    sdk: FieldAppSDK;
    isSelected: boolean;
    isDisabled: boolean;
    onEdit: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onRemove: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onEntityFetchComplete?: VoidFunction;
}
export declare function FetchingWrappedInlineEntryCard(props: FetchingWrappedInlineEntryCardProps): React.JSX.Element;
export {};
