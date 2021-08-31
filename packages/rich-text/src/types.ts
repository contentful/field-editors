import { PlatePluginOptions } from '@udecode/plate-core';

export type TextElement = { text: string };

export type CustomElement = {
  type: string;
  children: TextOrCustomElement[];
  data: object;
  isVoid?: boolean;
};

export type TextOrCustomElement = CustomElement | TextElement;

export type CustomSlatePluginOptions = Partial<Record<string, Partial<PlatePluginOptions>>>;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
