import { PlateEditor, isAncestorEmpty } from '@udecode/plate-core';
import { NodeEntry, Ancestor } from 'slate';

export const hasText = (editor: PlateEditor, entry: NodeEntry) => {
  const [node] = entry;
  return !isAncestorEmpty(editor, node as Ancestor);
};
