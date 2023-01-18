import { focus } from '../../../helpers/editor';
import { getText } from '../../../internal/queries';
import { setNodes, insertNodes } from '../../../internal/transforms';

const createNode = (nodeType, entity) => ({
  type: nodeType,
  data: {
    target: {
      sys: {
        id: entity.sys.id,
        type: 'Link',
        linkType: entity.sys.type,
      },
    },
  },
  children: [{ text: '' }],
  isVoid: true,
});

export function insertBlock(editor, nodeType, entity) {
  if (!editor?.selection) return;

  const linkedEntityBlock = createNode(nodeType, entity);

  const hasText = editor.selection && !!getText(editor, editor.selection.focus.path);

  if (hasText) {
    insertNodes(editor, linkedEntityBlock);
  } else {
    setNodes(editor, linkedEntityBlock);
  }

  focus(editor);
}
