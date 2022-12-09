// @ts-nocheck
import { insertNodes } from 'internal/transforms';
import { NodeEntry, Transforms } from 'slate';

import { RichTextEditor } from '../../types';

/**
 * Re-creates a void node with valid children.
 */
export const transformVoid = (editor: RichTextEditor, [node, path]: NodeEntry) => {
  const validVoid = {
    ...node,
    children: [{ text: '' }],
  };

  // A workaround because Slate doesn't allow adjusting void nodes children
  Transforms.removeNodes(editor, { at: path });
  insertNodes(editor, [validVoid], { at: path });
};
