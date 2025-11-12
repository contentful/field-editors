import { mockPlugin as mock } from '@udecode/plate-common';
import { randomId } from './randomId';
export const mockPlugin = (p)=>mock({
        ...p,
        key: p.key || randomId('plugin')
    });
