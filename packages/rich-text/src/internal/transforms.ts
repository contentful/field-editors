import * as p from '@udecode/plate-common';
import * as s from 'slate';
import { Except } from 'type-fest';

import { getEndPoint, isNode } from './queries';
import {
  PlateEditor,
  Node,
  ToggleNodeTypeOptions,
  EditorNodesOptions,
  BaseRange,
  Value,
  SelectionMoveOptions,
  TextInsertTextOptions,
  Element,
  SelectionCollapseOptions,
  Path,
  Span,
  BasePoint,
  Location,
} from './types';

/**
 * Apply editor normalization rules
 */
export const normalize = (
  editor: PlateEditor,
  options: s.EditorNormalizeOptions = { force: true },
) => {
  return p.normalizeEditor(editor, options);
};

export const withoutNormalizing = (editor: PlateEditor, fn: () => boolean | void) => {
  return p.withoutNormalizing(editor, fn);
};

/**
 * Set the selection to a location
 */
export const setSelection = (editor: PlateEditor, props: Partial<BaseRange>) => {
  return p.setSelection(editor, props);
};

export const select = (editor: PlateEditor, location: Location) => {
  return p.select(editor, location);
};

export const moveSelection = (editor: PlateEditor, options?: SelectionMoveOptions) => {
  return p.moveSelection(editor, options);
};

export const moveChildren = (editor: PlateEditor, options: p.MoveChildrenOptions<Value>) => {
  return p.moveChildren(editor, options);
};

export const collapseSelection = (editor: PlateEditor, options?: SelectionCollapseOptions) => {
  return p.collapseSelection(editor, options);
};

export const setNodes = (
  editor: PlateEditor,
  attrs: Partial<Except<Node, 'children' | 'text'>>,
  opts?: p.SetNodesOptions<Value>,
) => {
  p.setNodes(editor, attrs, opts);
};

export const unsetNodes = (
  editor: PlateEditor,
  props: string | number | (string | number)[],
  options?: p.UnsetNodesOptions<Value> | undefined,
) => {
  p.unsetNodes(editor, props, options);
};

export const insertNodes = (
  editor: PlateEditor,
  nodes: Node | Node[],
  opts?: p.InsertNodesOptions,
) => {
  return p.insertNodes(editor, nodes, opts);
};

export const splitNodes = (editor: PlateEditor, options?: p.SplitNodesOptions<Value>) => {
  return p.splitNodes(editor, options);
};

export const liftNodes = (editor: PlateEditor, options?: p.LiftNodesOptions<Value> | undefined) => {
  return p.liftNodes(editor, options);
};

export const unwrapNodes = (editor: PlateEditor, options?: p.UnwrapNodesOptions<Value>) => {
  return p.unwrapNodes(editor, options);
};

export const wrapNodes = (
  editor: PlateEditor,
  element: Element,
  options?: p.WrapNodesOptions<Value>,
) => {
  return p.wrapNodes(editor, element, options);
};

export const toggleNodeType = (
  editor: PlateEditor,
  options: ToggleNodeTypeOptions,
  editorOptions?: Omit<EditorNodesOptions, 'match'>,
) => {
  p.toggleNodeType(editor, options, editorOptions);
};

export const removeMark = (editor: PlateEditor, type: string, at: BaseRange) => {
  p.removeMark(editor, { key: type, at });
};

export const unhangRange = (
  editor: PlateEditor,
  range?: Path | BasePoint | BaseRange | Span | null | undefined,
  options?: p.UnhangRangeOptions | undefined,
) => {
  return p.unhangRange(editor, range, options);
};

export const toggleMark = (editor: PlateEditor, options: p.ToggleMarkOptions) => {
  return p.toggleMark(editor, options);
};

export const addMark = (editor: PlateEditor, type: string, value: unknown = true) => {
  p.addMark(editor, type, value);
};

export const insertText = (editor: PlateEditor, text: string, options?: TextInsertTextOptions) => {
  return p.insertText(editor, text, options);
};

export const deleteText = (editor: PlateEditor, opts?: Parameters<typeof p.deleteText>['1']) => {
  p.deleteText(editor, opts);
};

export const removeNodes = (editor: PlateEditor, opts?: p.RemoveNodesOptions<Value>) => {
  p.removeNodes(editor, opts);
};

export const moveNodes = (editor: PlateEditor, opts?: p.MoveNodesOptions<Value>) => {
  p.moveNodes(editor, opts);
};

export const deleteFragment = (
  editor: PlateEditor,
  options?: s.EditorFragmentDeletionOptions | undefined,
) => {
  return p.deleteFragment(editor, options);
};

/**
 * Plate api doesn't allow to modify (easily) the editor value
 * programmatically after the editor instance is created.
 *
 * This function is inspired by:
 * https://github.com/udecode/plate/issues/1269#issuecomment-1057643622
 */
export const setEditorValue = (editor: PlateEditor, nodes?: Node[]): void => {
  // Replaces editor content while keeping change history
  withoutNormalizing(editor, () => {
    const children = [...editor.children];
    children.forEach((node) => editor.apply({ type: 'remove_node', path: [0], node }));

    if (nodes) {
      const nodesArray = isNode(nodes) ? [nodes] : nodes;
      nodesArray.forEach((node, i) => {
        editor.apply({ type: 'insert_node', path: [i], node });
      });
    }

    const point = getEndPoint(editor, []);
    if (point) {
      select(editor, point);
    }
  });
};
