import { createBoldPlugin } from './Bold';
import { createCodePlugin } from './Code';
import { createItalicPlugin } from './Italic';
import { createUnderlinePlugin } from './Underline';
import { RichTextPlugin } from '../../types';

export const createMarksPlugin = (): RichTextPlugin => ({
  key: 'Marks',
  plugins: [createBoldPlugin(), createCodePlugin(), createItalicPlugin(), createUnderlinePlugin()],
});
