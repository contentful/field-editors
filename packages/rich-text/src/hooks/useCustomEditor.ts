import { useSlateStatic } from 'slate-react';
import { CustomEditor } from '../types';

export function useCustomEditor() {
  const editor = useSlateStatic() as CustomEditor;

  return editor;
}
