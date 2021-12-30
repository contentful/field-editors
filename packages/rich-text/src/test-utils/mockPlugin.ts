import { mockPlugin as mock } from '@udecode/plate-core';

import { RichTextPlugin } from '../types';
import { randomId } from './randomId';

export const mockPlugin = (p: Partial<RichTextPlugin>) =>
  mock({
    ...p,
    key: p.key || randomId('plugin'),
  });
