import { BaseEditor, Descendant, Path, BaseElement, BaseText } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type CustomElement = {
  type: string;
  children: Descendant[];
  isVoid?: boolean;
};

export type CustomText = { text: string };

export type CustomEditor = HistoryEditor &
  ReactEditor & {
    isMarkActive: (type: string) => boolean;
    toggleMark: (type: string) => void;
    isBlockSelected: (type: string) => boolean;
    isVoid: (element: CustomElement) => boolean;
    hasSelectionText: () => boolean;
    moveToTheNextLine: () => void;
    toggleBlock: (type: string) => void;
    getElementFromCurrentSelection: () => (BaseEditor | BaseElement | BaseText | Path)[];
  };

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
