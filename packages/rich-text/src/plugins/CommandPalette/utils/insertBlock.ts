import { focus } from '../../../helpers/editor';
import { getSelectionElementPath, isEmptyTextContainer } from '../../../internal/selection';
import { insertNodes, setNodes } from '../../../internal/transforms';

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

  const elementPath = getSelectionElementPath(editor);
  if (elementPath && isEmptyTextContainer(editor, elementPath)) {
    setNodes(editor, linkedEntityBlock, { at: elementPath });
    focus(editor);
    return;
  }

  insertNodes(editor, linkedEntityBlock);

  focus(editor);
}
