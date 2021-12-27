import { PlatePlugin } from '@udecode/plate-core';

import { createBoldPlugin } from './Bold';
import { createCodePlugin } from './Code';
import { createItalicPlugin } from './Italic';
import { createUnderlinePlugin } from './Underline';

export const createMarksPlugin = (): PlatePlugin => ({
  key: 'Marks',
  plugins: [createBoldPlugin(), createCodePlugin(), createItalicPlugin(), createUnderlinePlugin()],
});
