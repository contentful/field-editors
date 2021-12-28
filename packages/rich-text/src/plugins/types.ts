import { PlatePlugin } from '@udecode/plate-core';
import { ExitBreakRule, SoftBreakRule } from '@udecode/plate-break';

export interface RichTextPlugin extends PlatePlugin {
  /**
   * @see createSoftBreakPlugin
   */
  softBreak?: SoftBreakRule[];

  /**
   * @see createExitBreakPlugin
   */
  exitBreak?: ExitBreakRule[];
}
