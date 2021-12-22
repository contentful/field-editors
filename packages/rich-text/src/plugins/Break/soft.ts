import { PlatePlugin } from '@udecode/plate-core';
import { BLOCKS } from '@contentful/rich-text-types';
import { createSoftBreakPlugin as createDefaultSoftBreakPlugin } from '@udecode/plate-break';

export const createSoftBreakPlugin = (): PlatePlugin =>
  createDefaultSoftBreakPlugin({
    options: {
      rules: [
        // create a new line with SHIFT+Enter inside a paragraph
        {
          hotkey: 'shift+enter',
          query: {
            allow: BLOCKS.PARAGRAPH,
          },
        },
      ],
    },
  });
