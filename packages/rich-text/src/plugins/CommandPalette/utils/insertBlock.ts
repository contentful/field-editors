import { focus } from '../../../helpers/editor';
import { getText } from '../../../internal/queries';
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

  const focusPath = editor.selection.focus.path;
  const elementPath = focusPath.length > 0 ? focusPath.slice(0, -1) : focusPath;
  const elementText = getText(editor, elementPath);

  if (elementText.length === 0) {
    setNodes(editor, linkedEntityBlock, { at: elementPath });
    focus(editor);
    return;
  }

  insertNodes(editor, linkedEntityBlock);

  focus(editor);
}
