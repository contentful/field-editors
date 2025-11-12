import React from 'react';
export interface EmbedEntityWidgetProps {
    isDisabled?: boolean;
    canInsertBlocks?: boolean;
}
export declare const EmbedEntityWidget: ({ isDisabled, canInsertBlocks }: EmbedEntityWidgetProps) => React.JSX.Element | null;
