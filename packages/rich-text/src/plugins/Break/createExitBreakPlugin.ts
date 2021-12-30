import {
  createExitBreakPlugin as createDefaultExitBreakPlugin,
  ExitBreakRule,
} from '@udecode/plate-break';
import { isFirstChild } from '@udecode/plate-core';

import { isRootLevel } from '../../helpers/editor';
import { RichTextPlugin } from '../../types';

// The base were added here to avoid duplication of the rules in multiple void elements plugins
const baseRules: ExitBreakRule[] = [
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
];

export const createExitBreakPlugin = (): RichTextPlugin =>
  createDefaultExitBreakPlugin({
    then: (editor) => {
      const rules: ExitBreakRule[] = editor.plugins.flatMap((p) => {
        return (p as RichTextPlugin).exitBreak || [];
      });

      return {
        options: { rules: [...baseRules, ...rules] },
      };
    },
  });
