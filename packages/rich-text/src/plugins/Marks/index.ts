import { TrackingProvider } from '../../TrackingProvider';
import { RichTextPlugin } from '../../types';
import { createBoldPlugin } from './Bold';
import { createCodePlugin } from './Code';
import { createItalicPlugin } from './Italic';
import { createUnderlinePlugin } from './Underline';

export const createMarksPlugin = (tracking: TrackingProvider): RichTextPlugin => ({
  key: 'Marks',
  plugins: [
    createBoldPlugin(tracking),
    createCodePlugin(tracking),
    createItalicPlugin(tracking),
    createUnderlinePlugin(tracking),
  ],
});
