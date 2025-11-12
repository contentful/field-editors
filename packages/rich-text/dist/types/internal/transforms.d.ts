import * as p from '@udecode/plate-common';
import * as s from 'slate';
import { Except } from 'type-fest';
import { PlateEditor, Node, ToggleNodeTypeOptions, EditorNodesOptions, BaseRange, Value, SelectionMoveOptions, TextInsertTextOptions, Element, SelectionCollapseOptions, Path, Span, BasePoint, Location } from './types';
/**
 * Apply editor normalization rules
 */
export declare const normalize: (editor: PlateEditor, options?: s.EditorNormalizeOptions) => void;
export declare const withoutNormalizing: (editor: PlateEditor, fn: () => boolean | void) => boolean;
/**
 * Set the selection to a location
 */
export declare const setSelection: (editor: PlateEditor, props: Partial<BaseRange>) => void;
export declare const select: (editor: PlateEditor, location: Location) => void;
export declare const moveSelection: (editor: PlateEditor, options?: SelectionMoveOptions) => void;
export declare const moveChildren: (editor: PlateEditor, options: p.MoveChildrenOptions<Value>) => number;
export declare const collapseSelection: (editor: PlateEditor, options?: SelectionCollapseOptions) => void;
export declare const setNodes: (editor: PlateEditor, attrs: Partial<Except<Node, 'children' | 'text'>>, opts?: p.SetNodesOptions<Value>) => void;
export declare const unsetNodes: (editor: PlateEditor, props: string | number | (string | number)[], options?: p.UnsetNodesOptions<Value> | undefined) => void;
export declare const insertNodes: (editor: PlateEditor, nodes: Node | Node[], opts?: p.InsertNodesOptions) => void;
export declare const splitNodes: (editor: PlateEditor, options?: p.SplitNodesOptions<Value>) => void;
export declare const liftNodes: (editor: PlateEditor, options?: p.LiftNodesOptions<Value> | undefined) => void;
export declare const unwrapNodes: (editor: PlateEditor, options?: p.UnwrapNodesOptions<Value>) => void;
export declare const wrapNodes: (editor: PlateEditor, element: Element, options?: p.WrapNodesOptions<Value>) => void;
export declare const toggleNodeType: (editor: PlateEditor, options: ToggleNodeTypeOptions, editorOptions?: Omit<EditorNodesOptions, 'match'>) => void;
export declare const removeMark: (editor: PlateEditor, type: string, at: BaseRange) => void;
export declare const unhangRange: (editor: PlateEditor, range?: Path | BasePoint | BaseRange | Span | null | undefined, options?: p.UnhangRangeOptions | undefined) => s.Path | s.BaseRange | s.BasePoint | s.Span | null | undefined;
export declare const toggleMark: (editor: PlateEditor, options: p.ToggleMarkOptions) => void;
export declare const addMark: (editor: PlateEditor, type: string, value?: unknown) => void;
export declare const insertText: (editor: PlateEditor, text: string, options?: TextInsertTextOptions) => void;
export declare const deleteText: (editor: PlateEditor, opts?: Parameters<typeof p.deleteText>['1']) => void;
export declare const removeNodes: (editor: PlateEditor, opts?: p.RemoveNodesOptions<Value>) => void;
export declare const moveNodes: (editor: PlateEditor, opts?: p.MoveNodesOptions<Value>) => void;
export declare const deleteFragment: (editor: PlateEditor, options?: s.EditorFragmentDeletionOptions | undefined) => void;
/**
 * Plate api doesn't allow to modify (easily) the editor value
 * programmatically after the editor instance is created.
 *
 * This function is inspired by:
 * https://github.com/udecode/plate/issues/1269#issuecomment-1057643622
 */
export declare const setEditorValue: (editor: PlateEditor, nodes?: Node[]) => void;
