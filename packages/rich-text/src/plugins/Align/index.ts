import { RichTextPlugin } from '../../types';
import { createAlignPlugin as createDefaultAlignPlugin } from './Align';

export const createAlignPlugin = (): RichTextPlugin => ({
  key: 'Align',
  plugins: [createDefaultAlignPlugin()],
});
