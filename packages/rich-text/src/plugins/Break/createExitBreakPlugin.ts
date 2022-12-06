// @ts-nocheck
import {
  createExitBreakPlugin as createDefaultExitBreakPlugin,
  ExitBreakRule,
} from '@udecode/plate-break';

import { RichTextPlugin } from '../../types';

export const createExitBreakPlugin = (): RichTextPlugin =>
  createDefaultExitBreakPlugin({
    options: {
      rules: [],
    },
    then: (editor) => {
      const rules: ExitBreakRule[] = editor.plugins.flatMap((p) => {
        return (p as RichTextPlugin).exitBreak || [];
      });

      return {
        options: { rules },
      };
    },
  });
