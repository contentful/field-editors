import { RichTextPlugin } from '../../types';
import { createBoldPlugin } from './Bold';
import { createCodePlugin } from './Code';
import { createItalicPlugin } from './Italic';
import { createUnderlinePlugin } from './Underline';
import { createSuperscriptPlugin } from './Superscript';

export const createMarksPlugin = (): RichTextPlugin => ({
  key: 'Marks',
  plugins: [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createSuperscriptPlugin(),
  ],
});
