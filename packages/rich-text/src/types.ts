import { Descendant, Editor } from 'slate';
import { SlatePluginOptions, SPEditor } from '@udecode/slate-plugins-core';

export type CustomElement = {
  type: string;
  children: Descendant[];
  data: object;
  isVoid?: boolean;
};

export type CustomSlatePluginOptions = {
  [key: string]: SlatePluginOptions;
};

export type CustomEditor = Editor | SPEditor;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
