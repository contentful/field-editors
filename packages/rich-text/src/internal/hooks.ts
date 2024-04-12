import * as p from '@udecode/plate-common';
import * as sr from 'slate-react';

import { PlateEditor, Value } from './types';

export const useReadOnly = sr.useReadOnly;

export const usePlateEditorRef = (id?: string) => {
  return p.useEditorRef<Value, PlateEditor>(id);
};

export const usePlateEditorState = (id?: string) => {
  return p.useEditorState<Value, PlateEditor>(id);
};

export const usePlateSelectors = (id?: string) => {
  return p.usePlateSelectors(id);
};
