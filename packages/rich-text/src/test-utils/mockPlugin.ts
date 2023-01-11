import { mockPlugin as mock } from '@udecode/plate-core';

import { PlatePlugin } from '../internal/types';
import { randomId } from './randomId';

export const mockPlugin = (p: Partial<PlatePlugin>) =>
  mock<PlatePlugin>({
    ...(p as any),
    key: p.key || randomId('plugin'),
  }) as any;
