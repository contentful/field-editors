import { SoftBreakRule, ExitBreakRule } from '@udecode/plate-break';
import * as p from '@udecode/plate-common';
import { ResetNodePluginRule } from '@udecode/plate-reset-node';
import type { NormalizerRule } from '../../plugins/Normalizer';
import { Value, PlateEditor } from './editor';
export type KeyboardHandler<P = p.PluginOptions> = p.KeyboardHandler<P, Value, PlateEditor>;
export interface PlatePlugin extends p.PlatePlugin<p.AnyObject, Value, PlateEditor> {
    softBreak?: SoftBreakRule[];
    exitBreak?: ExitBreakRule[];
    resetNode?: ResetNodePluginRule<Value, PlateEditor>[];
    normalizer?: NormalizerRule[];
}
