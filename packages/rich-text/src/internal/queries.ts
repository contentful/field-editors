/**
 * Re-exporting Plate/Slate queries (aka selectors) to reduce
 * the blast radius of version upgrades
 */
import * as p from '@udecode/plate-core';

import type { Editor, Location, Node } from './types';

/**
 * Get text content at location
 */
export const getText = (editor: Editor, at: Location) => {
  return p.getEditorString(editor, at);
};

export const getEndPoint = (editor: Editor, at: Location) => {
  return p.getEndPoint(editor, at);
};

export const isNode = (value: unknown): value is Node => {
  return p.isNode(value);
};
