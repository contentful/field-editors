import { focus } from '../../../helpers/editor';
import { insertNodes } from '../../../internal/transforms';

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
  insertNodes(editor, linkedEntityBlock);

  focus(editor);
}
