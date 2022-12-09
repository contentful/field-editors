import * as p from '@udecode/plate-core';
import * as s from 'slate';

import { Editor, Location, Node } from './types';

/**
 * Apply editor normalization rules
 */
export const normalize = (editor: Editor, options?: s.EditorNormalizeOptions) => {
  return p.normalizeEditor(editor, options);
};

/**
 * Set the selection to a location
 */
export const setSelection = (editor: Editor, at: Location) => {
  return p.select(editor, at);
};

export const setNodes = (editor: Editor, attrs: Partial<Node>, opts?: p.SetNodesOptions) => {
  return p.setNodes(editor, attrs, opts);
};

export const insertNodes = (editor: Editor, nodes: Node | Node[], opts?: p.InsertNodesOptions) => {
  return p.insertNodes(editor, nodes, opts);
};
