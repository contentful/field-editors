import { useEditorRef, useEditorState, useReadOnly } from 'platejs/react';

import { PlateEditor } from './types';

export { useReadOnly };
export const usePlateEditorRef = (id?: string) => useEditorRef<PlateEditor>(id);
export const usePlateEditorState = (id?: string) => useEditorState<PlateEditor>(id);
