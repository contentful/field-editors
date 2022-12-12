import * as p from '@udecode/plate-core';
import * as s from 'slate';

import type { Value, PlateEditor, Location } from './types';

export const Path = s.Path;

export type CreatePlateEditorOptions = p.CreatePlateEditorOptions<Value, PlateEditor>;
export const createPlateEditor = (options: CreatePlateEditorOptions = {}) => {
  return p.createPlateEditor<Value, PlateEditor>(options);
};

export const withoutNormalizing = (editor: PlateEditor, fn: () => boolean | void) => {
  return p.withoutNormalizing(editor, fn);
};

export const focusEditor = (editor: PlateEditor, target?: Location) => {
  p.focusEditor(editor, target);
};

export const fromDOMPoint = (
  editor: PlateEditor,
  domPoint: [Node /* DOM Node*/, number],
  opts = { exactMatch: false, suppressThrow: false }
): s.BasePoint | null | undefined => {
  return p.toSlatePoint(editor, domPoint, opts);
};
