import * as p from '@udecode/plate-core';

import type { Value, Editor } from './types';

export type CreatePlateEditorOptions = p.CreatePlateEditorOptions<Value, Editor>;
export const createPlateEditor = (options: CreatePlateEditorOptions = {}) => {
  return p.createPlateEditor<Value, Editor>(options);
};

export const withoutNormalizing = (editor: Editor, fn: () => boolean | void) => {
  return p.withoutNormalizing(editor, fn);
};
