import { PlatePlugin } from '@udecode/plate-core';

import { createSoftBreakPlugin } from './soft';
import { createExitBreakPlugin } from './exit';

export const createBreakPlugin = (): PlatePlugin => ({
  key: 'BreakPlugin',
  plugins: [createSoftBreakPlugin(), createExitBreakPlugin()],
});
