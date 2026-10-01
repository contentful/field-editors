import { BLOCKS } from '@contentful/rich-text-types';

import { createResetNodePlugin as createDefaultResetNodePlugin } from '../../internal/breaks';
import { PlatePlugin } from '../../internal/types';

export const createResetNodePlugin = (): PlatePlugin =>
  createDefaultResetNodePlugin({
    options: {
      rules: [],
    },
    then: (editor) => {
      const rules = editor.contentfulPlugins.flatMap((p) => {
        return (p as PlatePlugin).resetNode || [];
      });

      // set defaultType to Paragraph if not set
      for (const rule of rules) {
        if (!rule.defaultType) {
          rule.defaultType = BLOCKS.PARAGRAPH;
        }
      }

      return {
        options: { rules },
      };
    },
  });
