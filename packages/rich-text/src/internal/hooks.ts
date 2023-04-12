import * as p from '@udecode/plate-common';
import * as sr from 'slate-react';

import { PlateEditor, Value } from './types/editor';

export const useReadOnly = sr.useReadOnly;
export const usePlateEditorRef = p.usePlateEditorRef;
export const usePlateEditorState = p.usePlateEditorState;
export const usePlateSelectors = (id?: any) => {
  return p.usePlateSelectors<Value, PlateEditor>(id);
};
export const usePlateActions = (id?: any) => {
  return p.usePlateActions<Value, PlateEditor>(id);
};
