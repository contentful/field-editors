import { PlatePlugin } from '../../internal/types';
import { createBoldPlugin } from './Bold';
import { createCodePlugin } from './Code';
import { createItalicPlugin } from './Italic';
import { createStrikethroughPlugin } from './Strikethrough';
import { createSubscriptPlugin } from './Subscript';
import { createSuperscriptPlugin } from './Superscript';
import { createUnderlinePlugin } from './Underline';

export const createMarksPlugin = (): PlatePlugin => ({
  key: 'Marks',
  plugins: [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createSuperscriptPlugin(),
    createSubscriptPlugin(),
    createStrikethroughPlugin(),
  ],
});
