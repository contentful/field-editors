import { BLOCKS } from '@contentful/rich-text-types';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

export const createTrailingParagraphPlugin = () => {
  return createTrailingBlockPlugin({
    type: BLOCKS.PARAGRAPH,
    options: {
      level: 0,
    },
  });
};
