/**
 * Re-exporting Plate/Slate queries (aka selectors) to reduce
 * the blast radius of version upgrades
 */
import * as p from '@udecode/plate-core';
import * as s from 'slate';

import type { PlateEditor, Location, Node } from './types';

/**
 * Get text content at location
 */
export const getText = (editor: PlateEditor, at: Location) => {
  return p.getEditorString(editor, at);
};

export const getEndPoint = (editor: PlateEditor, at: Location) => {
  return p.getEndPoint(editor, at);
};

export const isNode = (value: unknown): value is Node => {
  return p.isNode(value);
};

export const getNodeEntry = (editor: PlateEditor, at: Location, options?: s.EditorNodeOptions) => {
  return p.getNodeEntry(editor, at, options);
};

export const getNodeEntries = (editor: PlateEditor, options?: p.GetNodeEntriesOptions) => {
  return p.getNodeEntries(editor, options);
};
