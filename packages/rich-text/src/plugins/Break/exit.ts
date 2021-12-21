import { PlatePlugin } from '@udecode/plate-core';
import { createExitBreakPlugin as createDefaultExitBreakPlugin } from '@udecode/plate-break';

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
      ],
    },
  });
