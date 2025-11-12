import * as React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
interface FetchingWrappedEntryCardProps {
    entryId: string;
    isDisabled: boolean;
    isSelected: boolean;
    locale: string;
    sdk: FieldAppSDK;
    onEntityFetchComplete?: VoidFunction;
    onEdit?: VoidFunction;
    onRemove?: VoidFunction;
}
export declare const FetchingWrappedEntryCard: (props: FetchingWrappedEntryCardProps) => React.JSX.Element;
export {};
