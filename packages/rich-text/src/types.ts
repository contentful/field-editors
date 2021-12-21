import { PlatePlugin } from '@udecode/plate-core';
import { RenderElementProps, RenderLeafProps } from 'slate-react';

export type TextElement = { text: string };
export type TextOrCustomElement = CustomElement | TextElement;

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

export interface CustomPluginOptions extends Omit<PlatePlugin, 'component'> {
  component?:
    | React.FunctionComponent<CustomRenderElementProps>
    | React.FunctionComponent<RenderLeafProps>;
}

export type CustomSlatePluginOptions = Record<string, CustomPluginOptions>;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
