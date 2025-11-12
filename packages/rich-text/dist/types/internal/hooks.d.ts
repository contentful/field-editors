/// <reference types="react" />
import * as p from '@udecode/plate-common';
import { PlateEditor } from './types';
export declare const useReadOnly: () => boolean;
export declare const usePlateEditorRef: (id?: string) => PlateEditor;
export declare const usePlateEditorState: (id?: string) => PlateEditor;
export declare const usePlateSelectors: (id?: string) => {
    editor: (options?: string | import("jotai-x").UseAtomOptions | undefined) => p.PlateEditor<p.Value>;
    id: (options?: string | import("jotai-x").UseAtomOptions | undefined) => string;
    plugins: (options?: string | import("jotai-x").UseAtomOptions | undefined) => p.WithPlatePlugin<p.AnyObject, p.Value, p.PlateEditor<p.Value>>[];
    rawPlugins: (options?: string | import("jotai-x").UseAtomOptions | undefined) => p.PlatePlugin<p.AnyObject, p.Value, p.PlateEditor<p.Value>>[];
    value: (options?: string | import("jotai-x").UseAtomOptions | undefined) => p.Value;
    decorate: (options?: string | import("jotai-x").UseAtomOptions | undefined) => ((entry: p.TNodeEntry) => import("slate").BaseRange[]) | null;
    editorRef: (options?: string | import("jotai-x").UseAtomOptions | undefined) => import("react").ForwardedRef<p.PlateEditor<p.Value>>;
    isMounted: (options?: string | import("jotai-x").UseAtomOptions | undefined) => boolean | null;
    onChange: (options?: string | import("jotai-x").UseAtomOptions | undefined) => ((value: p.Value) => void) | null;
    onSelectionChange: (options?: string | import("jotai-x").UseAtomOptions | undefined) => ((selection: import("slate").BaseSelection) => void) | null;
    onValueChange: (options?: string | import("jotai-x").UseAtomOptions | undefined) => ((value: p.Value) => void) | null;
    primary: (options?: string | import("jotai-x").UseAtomOptions | undefined) => boolean | null;
    readOnly: (options?: string | import("jotai-x").UseAtomOptions | undefined) => boolean | null;
    renderElement: (options?: string | import("jotai-x").UseAtomOptions | undefined) => p.RenderElementFn | null;
    renderLeaf: (options?: string | import("jotai-x").UseAtomOptions | undefined) => p.RenderLeafFn | null;
    versionDecorate: (options?: string | import("jotai-x").UseAtomOptions | undefined) => number | null;
    versionEditor: (options?: string | import("jotai-x").UseAtomOptions | undefined) => number | null;
    versionSelection: (options?: string | import("jotai-x").UseAtomOptions | undefined) => number | null;
    trackedEditor: (options?: string | import("jotai-x").UseAtomOptions | undefined) => {
        editor: any;
        version: number | null;
    };
    trackedSelection: (options?: string | import("jotai-x").UseAtomOptions | undefined) => {
        selection: any;
        version: number | null;
    };
} & {
    atom: <V>(atom: import("jotai").Atom<V>, options?: string | import("jotai-x").UseAtomOptions | undefined) => V;
};
