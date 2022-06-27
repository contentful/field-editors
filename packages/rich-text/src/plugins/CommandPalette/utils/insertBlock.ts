import { getText } from '@udecode/plate-core';
import { Transforms } from 'slate';

import { focus } from '../../../helpers/editor';

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

// TODO: DRY up copied code from HR
export function insertBlock(editor, nodeType, entity) {
  if (!editor?.selection) return;

  const linkedEntityBlock = createNode(nodeType, entity);

  const hasText = editor.selection && !!getText(editor, editor.selection.focus.path);

  if (hasText) {
    Transforms.insertNodes(editor, linkedEntityBlock);
  } else {
    Transforms.setNodes(editor, linkedEntityBlock);
  }

  focus(editor);
}
