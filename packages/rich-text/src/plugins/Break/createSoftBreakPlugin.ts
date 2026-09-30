import {
  createSoftBreakPlugin as createDefaultSoftBreakPlugin,
  SoftBreakRule
} from '../../internal/breaks';
import { PlatePlugin } from '../../internal/types';

export const createSoftBreakPlugin = (): PlatePlugin =>
  createDefaultSoftBreakPlugin({
    then: (editor) => {
      const rules: SoftBreakRule[] = editor.contentfulPlugins.flatMap((p) => {
        return (p as PlatePlugin).softBreak || [];
      });

      return {
        options: { rules }
      };
    }
  });
