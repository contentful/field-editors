import * as React from 'react';
import * as Slate from 'slate-react';
import { PlatePlugin, PlateEditor } from '../../internal/types';
interface ToolbarHrButtonProps {
    isDisabled?: boolean;
}
export declare function withHrEvents(editor: PlateEditor): (event: React.KeyboardEvent) => void;
export declare function ToolbarHrButton(props: ToolbarHrButtonProps): React.JSX.Element | null;
export declare function Hr(props: Slate.RenderLeafProps): React.JSX.Element;
export declare const createHrPlugin: () => PlatePlugin;
export {};
