import { Merge } from 'type-fest';
import { FunctionComponent } from 'react';
import { PlatePluginOptions } from '@udecode/plate-core';
import { RenderElementProps, RenderLeafProps } from 'slate-react';

export type TextElement = { text: string };

export type CustomElement<T = unknown> = {
  type: string;
  children: TextOrCustomElement[];
  data: T;
  isVoid?: boolean;
};

export type TextOrCustomElement = CustomElement | TextElement;

export type CustomSlatePluginOptions = {
  [key: string]: Merge<
    PlatePluginOptions,
    {
      component?: FunctionComponent<CustomRenderElementProps> | FunctionComponent<RenderLeafProps>;
    }
  >;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomRenderElementProps<T = any> = Merge<
  RenderElementProps,
  {
    element: CustomElement<T>;
  }
>;

declare module 'slate' {
  interface CustomTypes {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Element: CustomElement<any>;
  }
}
