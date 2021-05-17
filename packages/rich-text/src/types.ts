import { BaseEditor, Element } from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomElement = Element & {
  type: string;
  children: CustomElement[];
  isVoid?: boolean;
};

export type CustomText = { text: string };

export type CustomEditor = BaseEditor &
  ReactEditor & {
    isMarkActive: (type: string) => boolean;
    toggleMark: (type: string) => void;
    isBlockSelected: (type: string) => boolean;
    isVoid: (element: CustomElement) => boolean;
  };

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
