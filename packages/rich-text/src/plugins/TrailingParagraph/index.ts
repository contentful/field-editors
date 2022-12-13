import { BLOCKS } from '@contentful/rich-text-types';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { PlatePlugin } from '../../internal/types';

export const createTrailingParagraphPlugin = (): PlatePlugin => {
  return createTrailingBlockPlugin({
    options: {
      type: BLOCKS.PARAGRAPH,
      level: 0,
    },
  });
};
