import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor } from '@udecode/plate-core';
import { Transforms, Element, Editor } from 'slate';

import { isBlockSelected } from '../../helpers/editor';

export function toggleQuote(editor: PlateEditor): void {
  if (!editor.selection) return;

  const isActive = isBlockSelected(editor, BLOCKS.QUOTE);

  Editor.withoutNormalizing(editor, () => {
    Transforms.unwrapNodes(editor, {
      match: (node) => Element.isElement(node) && node.type === BLOCKS.QUOTE,
      split: true,
    });

    Transforms.setNodes(editor, {
      type: isActive ? BLOCKS.PARAGRAPH : BLOCKS.QUOTE,
    });

    if (!isActive) {
      const quote = {
        type: BLOCKS.QUOTE,
        data: {},
        children: [],
      };

      Transforms.wrapNodes(editor, quote);
    }
  });
}
