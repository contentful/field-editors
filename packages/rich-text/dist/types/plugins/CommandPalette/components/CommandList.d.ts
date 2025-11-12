import * as React from 'react';
import { PlateEditor } from '../../../internal/types';
export interface CommandListProps {
    query: string;
    editor: PlateEditor;
    textContainer?: HTMLSpanElement;
}
export declare const CommandList: ({ query, editor, textContainer }: CommandListProps) => React.JSX.Element | null;
