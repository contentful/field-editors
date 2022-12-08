/**
 * Re-exporting Plate/Slate queries (aka selectors) to reduce
 * the blast radius of version upgrades
 */
import { getEditorString } from '@udecode/plate-core';

import type { BaseEditor, Location } from './types';

/**
 * Get text content at location
 */
export const getText = (editor: BaseEditor, at: Location) => {
  return getEditorString(editor, at);
};
