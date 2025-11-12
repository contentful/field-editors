/// <reference types="react" />
import * as p from '@udecode/plate-common';
import * as s from 'slate';
import type { Value, PlateEditor, Location, PlatePlugin } from './types';
export type CreatePlateEditorOptions = Omit<p.CreatePlateEditorOptions<Value, PlateEditor>, 'plugins'> & {
    plugins?: PlatePlugin[];
};
export declare const createPlateEditor: (options?: CreatePlateEditorOptions) => PlateEditor & {
    blockFactory: (node?: Partial<p.TElement> | undefined, path?: s.Path | undefined) => p.TElement;
    childrenFactory: () => Value;
    currentKeyboardEvent: import("react").KeyboardEvent<Element> | null;
    isFallback: boolean;
    key: any;
    plugins: p.WithPlatePlugin<{}, Value, p.PlateEditor<Value>>[];
    pluginsByKey: Record<string, p.WithPlatePlugin<{}, Value, p.PlateEditor<Value>>>;
    prevSelection: s.BaseRange | null;
} & p.PlateEditorMethods<Value> & Omit<s.BaseEditor, "isVoid" | "children" | "operations" | "marks" | "apply" | "getDirtyPaths" | "getFragment" | "markableVoid" | "normalizeNode" | "insertFragment" | "insertNode" | "isInline" | "id"> & {
    apply: <N extends p.TDescendant>(operation: p.TOperation<N>) => void;
    children: Value;
    getDirtyPaths: <N_1 extends p.TDescendant>(operation: p.TOperation<N_1>) => s.Path[];
    getFragment: <N_2 extends p.TDescendant>() => N_2[];
    id: any;
    insertFragment: <N_3 extends p.TDescendant>(fragment: N_3[]) => void;
    insertNode: <N_4 extends p.TDescendant>(node: N_4) => void;
    isInline: <N_5 extends p.TElement>(element: N_5) => boolean;
    isVoid: <N_6 extends p.TElement>(element: N_6) => boolean;
    markableVoid: <N_7 extends p.TElement>(element: N_7) => boolean;
    marks: Record<string, any> | null;
    normalizeNode: <N_8 extends p.TNode>(entry: p.TNodeEntry<N_8>, options?: {
        operation?: p.TOperation<p.TDescendant> | undefined;
    } | undefined) => void;
    operations: p.TOperation<p.TDescendant>[];
} & p.UnknownObject & Pick<import("slate-history").HistoryEditor, "history" | "redo" | "undo" | "writeHistory"> & Pick<import("slate-react").ReactEditor, "hasEditableTarget" | "hasRange" | "hasSelectableTarget" | "hasTarget" | "insertData" | "insertFragmentData" | "insertTextData" | "isTargetInsideNonReadonlyVoid" | "setFragmentData">;
/**
 * The only reason for this helper to exist is to run the initial normalization
 * before mounting the Plate editor component which in turn avoids the false
 * trigger of `onChange`.
 *
 * Background:
 *
 * Due to legacy behavior, it's possible to have "valid" RT document (based on
 * the schema from rich-text-types) that doesn't make sense. For example, links
 * with no text nodes?[1]. Solving that requires an initial normalization pass
 * which modifies the slate tree by definition -> triggering onChange.
 *
 * The initial onChange trigger is undesirable as the user may not have touched
 * the RT content yet or the editor is rendered as readonly.
 *
 * Ideally, we should not initialize the editor twice but that's the only
 * way that I could get this to work. Improvements are welcome.
 *
 * [1]: See cypress/e2e/rich-text/.../invalidDocumentNormalizable.js for more
 *      examples.
 */
export declare const normalizeInitialValue: (options: CreatePlateEditorOptions, initialValue?: Value) => Value;
export declare const focusEditor: (editor: PlateEditor, target?: Location) => void;
export declare const blurEditor: (editor: PlateEditor) => void;
export declare const selectEditor: (editor: PlateEditor, opts: p.SelectEditorOptions) => void;
export declare const fromDOMPoint: (editor: PlateEditor, domPoint: [Node, number], opts?: {
    exactMatch: boolean;
    suppressThrow: boolean;
}) => s.BasePoint | null | undefined;
export declare const mockPlugin: (plugin?: Partial<PlatePlugin> | undefined) => p.WithPlatePlugin<p.AnyObject, p.Value, p.PlateEditor<p.Value>>;
