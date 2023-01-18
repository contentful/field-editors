import { insertNodes, removeNodes } from '../../internal/transforms';
import { NodeEntry, PlateEditor } from '../../internal/types';

/**
 * Re-creates a void node with valid children.
 */
export const transformVoid = (editor: PlateEditor, [node, path]: NodeEntry) => {
  const validVoid = {
    ...node,
    children: [{ text: '' }],
  };

  // A workaround because Slate doesn't allow adjusting void nodes children
  removeNodes(editor, { at: path });
  insertNodes(editor, [validVoid], { at: path });
};
