import { INLINES } from '@contentful/rich-text-types';
import { createSelectOnBackspacePlugin as createDefaultSelectPlugin } from '@udecode/plate-select';

import { PlatePlugin } from '../../internal/types';

export const createSelectOnBackspacePlugin = (): PlatePlugin =>
  createDefaultSelectPlugin({
    options: {
      query: {
        // `createTextPlugin` is taking care of block elements
        allow: [INLINES.EMBEDDED_ENTRY],
      },
    },
  });
