import {
  createExitBreakPlugin as createDefaultExitBreakPlugin,
  ExitBreakRule,
} from '@udecode/plate-break';

import { PlatePlugin } from '../../internal/types';

export const createExitBreakPlugin = (): PlatePlugin =>
  createDefaultExitBreakPlugin({
    options: {
      rules: [],
    },
    then: (editor) => {
      const rules: ExitBreakRule[] = editor.plugins.flatMap((p) => {
        return (p as PlatePlugin).exitBreak || [];
      });

      return {
        options: { rules },
      };
    },
  });
