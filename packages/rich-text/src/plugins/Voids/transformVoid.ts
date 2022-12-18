import { insertNodes, removeNodes } from '../../internal/transforms';
import { NodeEntry } from '../../internal/types';
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
  removeNodes(editor, { at: path });
  insertNodes(editor, [validVoid], { at: path });
};
