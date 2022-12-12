import * as p from '@udecode/plate-core';
import * as s from 'slate';

import { PlateEditor, Location, Node } from './types';

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

export const setNodes = (editor: PlateEditor, attrs: Partial<Node>, opts?: p.SetNodesOptions) => {
  return p.setNodes(editor, attrs, opts);
};

export const insertNodes = (
  editor: PlateEditor,
  nodes: Node | Node[],
  opts?: p.InsertNodesOptions
) => {
  return p.insertNodes(editor, nodes, opts);
};
