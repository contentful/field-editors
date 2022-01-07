import { PlateEditor, isAncestorEmpty } from '@udecode/plate-core';
import { NodeEntry, Ancestor, Node } from 'slate';

export const hasText = (editor: PlateEditor, entry: NodeEntry) => {
  const [node] = entry;
  return !isAncestorEmpty(editor, node as Ancestor) && Node.string(node).trim() !== '';
};
