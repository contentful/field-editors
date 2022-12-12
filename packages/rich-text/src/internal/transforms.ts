import * as p from '@udecode/plate-core';
import * as s from 'slate';
import { Except } from 'type-fest';

import {
  PlateEditor,
  Location,
  Node,
  ToggleNodeTypeOptions,
  EditorNodesOptions,
  BaseRange,
  Value,
  SelectionMoveOptions,
  TextInsertTextOptions,
  Element,
  SelectionCollapseOptions,
} from './types';

/**
 * Apply editor normalization rules
 */
export const normalize = (editor: PlateEditor, options?: s.EditorNormalizeOptions) => {
  return p.normalizeEditor(editor, options);
};

/**
 * Set the selection to a location
 */
export const setSelection = (editor: PlateEditor, at: Location) => {
  return p.select(editor, at);
};

export const moveSelection = (editor: PlateEditor, options?: SelectionMoveOptions) => {
  return p.moveSelection(editor, options);
};

export const collapseSelection = (editor: PlateEditor, options?: SelectionCollapseOptions) => {
  return p.collapseSelection(editor, options);
};

export const setNodes = (
  editor: PlateEditor,
  attrs: Partial<Except<Node, 'children' | 'text'>>,
  opts?: p.SetNodesOptions<Value>
) => {
  p.setNodes(editor, attrs, opts);
};

export const insertNodes = (
  editor: PlateEditor,
  nodes: Node | Node[],
  opts?: p.InsertNodesOptions
) => {
  return p.insertNodes(editor, nodes, opts);
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
  options?: p.WrapNodesOptions<Value>
) => {
  return p.wrapNodes(editor, element, options);
};

export const toggleNodeType = (
  editor: PlateEditor,
  options: ToggleNodeTypeOptions,
  editorOptions?: Omit<EditorNodesOptions, 'match'>
) => {
  p.toggleNodeType(editor, options, editorOptions);
};

export const removeMark = (editor: PlateEditor, type: string, at: BaseRange) => {
  p.removeMark(editor, { key: type, at });
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
