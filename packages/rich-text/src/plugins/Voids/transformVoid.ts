import { NodeEntry, Transforms } from 'slate';
import { PlateEditor } from '@udecode/plate-core';

/**
 * Re-creates a void node with valid children.
 */
export const transformVoid = (editor: PlateEditor, [node, path]: NodeEntry) => {
  const validVoid = {
    ...node,
    children: [{ text: '' }],
  };

  // A workaround because Slate doesn't allow adjusting void nodes children
  Transforms.removeNodes(editor, { at: path });
  Transforms.insertNodes(editor, [validVoid], { at: path });
};
