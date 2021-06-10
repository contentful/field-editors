import { Descendant } from 'slate';
import { SlatePluginOptions } from '@udecode/slate-plugins-core';

export type CustomElement = {
  type: string;
  children: Descendant[];
  isVoid?: boolean;
};

export type CustomSlatePluginOptions = {
  [key: string]: SlatePluginOptions;
};

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
