// @ts-nocheck
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
  Transforms.insertNodes(editor, [validVoid], { at: path });
};
