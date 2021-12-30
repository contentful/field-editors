import { MARKS } from '@contentful/rich-text-types';
import { PlatePlugin } from '@udecode/plate-core';
import { RenderElementProps } from 'slate-react';

import type { SoftBreakRule, ExitBreakRule } from './plugins/Break';
import type { NormalizerRule } from './plugins/Normalizer';

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

export interface RichTextPlugin extends PlatePlugin {
  /**
   * @see createSoftBreakPlugin
   */
  softBreak?: SoftBreakRule[];

  /**
   * @see createExitBreakPlugin
   */
  exitBreak?: ExitBreakRule[];

  /**
   * @see createNormalizerPlugin
   */
  normalizer?: NormalizerRule[];
}
