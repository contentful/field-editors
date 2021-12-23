import { PlatePlugin } from '@udecode/plate-core';
import { createExitBreakPlugin as createDefaultExitBreakPlugin } from '@udecode/plate-break';
import { BLOCKS } from '@contentful/rich-text-types';

import { isFirstChild, isRootLevel } from '../../helpers/editor';

export const createExitBreakPlugin = (): PlatePlugin =>
  createDefaultExitBreakPlugin({
    options: {
      rules: [
        // Can insert before first void block
        {
          hotkey: 'enter',
          before: true,
          query: {
            filter: ([node, path]) => isRootLevel(path) && isFirstChild(path) && !!node.isVoid,
          },
        },
        // Can insert after a void block
        {
          hotkey: 'enter',
          query: {
            filter: ([node, path]) => !isFirstChild(path) && !!node.isVoid,
          },
        },
        // Pressing ENTER at the start or end of a heading text inserts a
        // normal paragraph
        {
          hotkey: 'enter',
          query: {
            allow: [
              BLOCKS.HEADING_1,
              BLOCKS.HEADING_2,
              BLOCKS.HEADING_3,
              BLOCKS.HEADING_4,
              BLOCKS.HEADING_5,
              BLOCKS.HEADING_6,
            ],
            end: true,
            start: true,
          },
        },
      ],
    },
  });
