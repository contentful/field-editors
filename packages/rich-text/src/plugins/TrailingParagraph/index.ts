import { BLOCKS } from '@contentful/rich-text-types';

import { PlatePlugin } from '../../internal/types';

export const createTrailingParagraphPlugin = (): PlatePlugin => ({
  key: 'trailingBlock',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;
    editor.normalizeNode = (entry, options) => {
      if (entry[1].length === 0 && editor.children.at(-1)?.type !== BLOCKS.PARAGRAPH) {
        editor.tf.insertNodes(
          { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] },
          { at: [editor.children.length] }
        );
        return;
      }
      normalizeNode(entry, options);
    };
    return editor;
  }
});
