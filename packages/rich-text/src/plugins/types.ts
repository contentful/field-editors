import { PlatePlugin } from '@udecode/plate-core';
import { SoftBreakRule } from '@udecode/plate-break';

export interface RichTextPlugin extends PlatePlugin {
  /**
   * @see createSoftBreakPlugin
   */
  softBreak?: SoftBreakRule[];
}
