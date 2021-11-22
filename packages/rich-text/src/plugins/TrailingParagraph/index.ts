import { BLOCKS } from '@contentful/rich-text-types';
import { createTrailingBlockPlugin } from '@udecode/plate';

export const createTrailingParagraphPlugin = () => {
  return createTrailingBlockPlugin({
    type: BLOCKS.PARAGRAPH,
    level: 0,
  });
};
