import { isAncestorEmpty } from '@udecode/plate-core';
import { NodeEntry, Ancestor, Node } from 'slate';

import { RichTextEditor } from '../../types';

export const hasText = (editor: RichTextEditor, entry: NodeEntry) => {
  const [node] = entry;
  return !isAncestorEmpty(editor, node as Ancestor) && Node.string(node).trim() !== '';
};
