import { SlatePluginOptions } from '@udecode/slate-plugins-core';

export type TextElement = { text: string };

export type CustomElement = {
  type: string;
  children: TextOrCustomElement[];
  data: object;
  isVoid?: boolean;
};

export type TextOrCustomElement = CustomElement | TextElement;

export type CustomSlatePluginOptions = {
  [key: string]: SlatePluginOptions;
};

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
