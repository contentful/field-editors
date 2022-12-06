import { BaseEditor, NodeEntry, Transforms } from 'slate';

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
  Transforms.removeNodes(editor as unknown as BaseEditor, { at: path });
  Transforms.insertNodes(editor as unknown as BaseEditor, [validVoid], { at: path });
};
