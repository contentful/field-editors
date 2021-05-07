import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

export interface ContentfulEditor extends BaseEditor, ReactEditor {
  isMarkActive: (type: string) => boolean;
  toggleMark: (type: string) => void;
}
