// @ts-nocheck
import {
  createSoftBreakPlugin as createDefaultSoftBreakPlugin,
  SoftBreakRule,
} from '@udecode/plate-break';

import { RichTextPlugin } from '../../types';

export const createSoftBreakPlugin = (): RichTextPlugin =>
  createDefaultSoftBreakPlugin({
    then: (editor) => {
      const rules: SoftBreakRule[] = editor.plugins.flatMap((p) => {
        return (p as RichTextPlugin).softBreak || [];
      });

      return {
        options: { rules },
      };
    },
  });
