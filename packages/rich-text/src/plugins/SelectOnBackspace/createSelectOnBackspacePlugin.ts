import { BLOCKS } from '@contentful/rich-text-types';
import { createSelectOnBackspacePlugin as createDefaultSelectPlugin } from '@udecode/plate-select';

import { RichTextPlugin } from '../../types';

export const createSelectOnBackspacePlugin = (): RichTextPlugin =>
  createDefaultSelectPlugin({
    options: {
      query: { allow: [BLOCKS.EMBEDDED_ASSET, BLOCKS.EMBEDDED_ENTRY, BLOCKS.HR] },
    },
  });
