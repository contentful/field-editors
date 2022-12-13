import * as p from '@udecode/plate-core';
import * as s from 'slate';

import type { Value, PlateEditor } from './types';

export type CreatePlateEditorOptions = p.CreatePlateEditorOptions<Value, PlateEditor>;
export const createPlateEditor = (options: CreatePlateEditorOptions = {}) => {
  return p.createPlateEditor<Value, PlateEditor>(options);
};

export const withoutNormalizing = (editor: PlateEditor, fn: () => boolean | void) => {
  return p.withoutNormalizing(editor, fn);
};

export const selectEditor = (editor: PlateEditor, opts: p.SelectEditorOptions) => {
  p.selectEditor(editor, opts);
};

export const fromDOMPoint = (
  editor: PlateEditor,
  domPoint: [Node /* DOM Node*/, number],
  opts = { exactMatch: false, suppressThrow: false }
): s.BasePoint | null | undefined => {
  return p.toSlatePoint(editor, domPoint, opts);
};
