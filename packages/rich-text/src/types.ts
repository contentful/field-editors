import { RenderElementProps } from 'slate-react';
import { MARKS } from '@contentful/rich-text-types';

export type CustomText = {
  text: string;
  [MARKS.BOLD]?: boolean;
  [MARKS.CODE]?: boolean;
  [MARKS.ITALIC]?: boolean;
  [MARKS.UNDERLINE]?: boolean;
};

export type TextOrCustomElement = CustomElement | CustomText;

export type CustomElement<T = unknown> = {
  type: string;
  children: TextOrCustomElement[];
  data: T;
  isVoid?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomRenderElementProps<T = any, O = any> = Omit<RenderElementProps, 'element'> & {
  element: CustomElement<T>;
} & O;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}
