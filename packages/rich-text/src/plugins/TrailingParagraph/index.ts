import { BLOCKS } from '@contentful/rich-text-types';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { RichTextPlugin } from '../../types';

export const createTrailingParagraphPlugin = (): RichTextPlugin => {
  return createTrailingBlockPlugin({
    options: {
      type: BLOCKS.PARAGRAPH,
      level: 0,
      exclude: [BLOCKS.EMBEDDED_ENTRY, BLOCKS.EMBEDDED_ASSET],
    },
  });
};
