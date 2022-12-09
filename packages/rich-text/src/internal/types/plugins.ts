import { SoftBreakRule, ExitBreakRule } from '@udecode/plate-break';
import * as p from '@udecode/plate-core';
import { ResetNodePluginRule } from '@udecode/plate-reset-node';

import type { NormalizerRule } from '../../plugins/Normalizer';
import { Value, Editor } from './editor';

export type KeyboardHandler<P = p.PluginOptions> = p.KeyboardHandler<P, Value, Editor>;

export interface PlatePlugin extends p.PlatePlugin {
  softBreak?: SoftBreakRule[];
  exitBreak?: ExitBreakRule[];
  resetNode?: ResetNodePluginRule[];
  normalizer?: NormalizerRule[];
}
