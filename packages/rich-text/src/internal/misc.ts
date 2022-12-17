import * as p from '@udecode/plate-core';

import type { Value, PlateEditor } from './types';

export type CreatePlateEditorOptions = p.CreatePlateEditorOptions<Value, PlateEditor>;
export const createPlateEditor = (options: CreatePlateEditorOptions = {}) => {
  return p.createPlateEditor<Value, PlateEditor>(options);
};

export const withoutNormalizing = (editor: PlateEditor, fn: () => boolean | void) => {
  return p.withoutNormalizing(editor, fn);
};
