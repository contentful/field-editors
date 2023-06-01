import { PlatePlugin } from '../../internal/types';
import { createBoldPlugin } from './Bold';
import { createCodePlugin } from './Code';
import { INLINE_COMMENT_HIGHLIGHT } from './helpers';
import { InlineComment as InlineCommentComponent } from './InlineComment';
import { createItalicPlugin } from './Italic';
import { createSubscriptPlugin } from './Subscript';
import { createSuperscriptPlugin } from './Superscript';
import { createUnderlinePlugin } from './Underline';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const createInlineCommentsPlugin = () => ({
  key: INLINE_COMMENT_HIGHLIGHT,
  isLeaf: true,
  component: InlineCommentComponent,
});

export const createMarksPlugin = (): PlatePlugin => ({
  key: 'Marks',
  plugins: [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createSuperscriptPlugin(),
    createSubscriptPlugin(),
    createInlineCommentsPlugin(),
  ],
});
