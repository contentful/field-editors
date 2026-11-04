import { useEditorRef, useEditorState } from 'platejs/react';

import { PlateEditor } from './types';

export { useReadOnly, useEditorPluginOptions } from 'platejs/react';

export const usePlateEditorRef = (id?: string) => useEditorRef<PlateEditor>(id);

export const usePlateEditorState = (id?: string) => useEditorState<PlateEditor>(id);
