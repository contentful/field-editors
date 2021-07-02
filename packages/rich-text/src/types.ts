import { Descendant } from 'slate';
import { SlatePluginOptions, SPEditor } from '@udecode/slate-plugins-core';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type CustomElement = {
  type: string;
  children: Descendant[];
  data: object;
  isVoid?: boolean;
};

export type CustomSlatePluginOptions = {
  [key: string]: SlatePluginOptions;
};

export type CustomEditor = ReactEditor & HistoryEditor & SPEditor;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
