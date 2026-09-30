import {
  createExitBreakPlugin as createDefaultExitBreakPlugin,
  ExitBreakRule
} from '../../internal/breaks';
import { PlatePlugin } from '../../internal/types';

export const createExitBreakPlugin = (): PlatePlugin =>
  createDefaultExitBreakPlugin({
    options: {
      rules: []
    },
    then: (editor) => {
      const rules: ExitBreakRule[] = editor.contentfulPlugins.flatMap((p) => {
        return (p as PlatePlugin).exitBreak || [];
      });

      return {
        options: { rules }
      };
    }
  });
