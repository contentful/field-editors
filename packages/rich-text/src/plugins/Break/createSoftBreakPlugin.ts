import {
  createSoftBreakPlugin as createDefaultSoftBreakPlugin,
  SoftBreakRule,
} from '@udecode/plate-break';

import { PlatePlugin } from '../../internal/types';

export const createSoftBreakPlugin = (): PlatePlugin =>
  createDefaultSoftBreakPlugin({
    then: (editor) => {
      const rules: SoftBreakRule[] = editor.plugins.flatMap((p) => {
        return (p as PlatePlugin).softBreak || [];
      });

      return {
        options: { rules },
      };
    },
  });
