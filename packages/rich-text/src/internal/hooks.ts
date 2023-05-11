import * as p from '@udecode/plate-core';
import * as sr from 'slate-react';

import { PlateEditor, Value } from './types';

export const useReadOnly = sr.useReadOnly;

export const usePlateEditorRef = (id: string) => {
  return p.usePlateEditorRef<Value, PlateEditor>(id);
};

export const usePlateEditorState = (id: string) => {
  return p.usePlateEditorState<Value, PlateEditor>(id);
};

export const usePlateSelectors = (id: string) => {
  return p.usePlateSelectors<Value, PlateEditor>(id);
};
