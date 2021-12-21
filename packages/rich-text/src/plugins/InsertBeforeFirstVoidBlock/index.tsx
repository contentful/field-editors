import { PlatePlugin } from '@udecode/plate-core';
import { createExitBreakPlugin } from '@udecode/plate-break';

import { isFirstChild, isRootLevel } from '../../helpers/editor';

export const createInsertBeforeFirstVoidBlockPlugin = (): PlatePlugin =>
  createExitBreakPlugin({
    options: {
      rules: [
        {
          hotkey: 'enter',
          before: true,
          query: {
            filter: ([node, path]) => isRootLevel(path) && isFirstChild(path) && !!node.isVoid,
          },
        },
        {
          hotkey: 'enter',
          query: {
            filter: ([node, path]) => !isFirstChild(path) && !!node.isVoid,
          },
        },
      ],
    },
  });
