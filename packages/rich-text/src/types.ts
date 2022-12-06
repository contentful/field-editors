import { MARKS } from '@contentful/rich-text-types';
import { AnyObject, PlateEditor, PlatePlugin, Value } from '@udecode/plate-core';
import { RenderElementProps } from 'slate-react';

import type { SoftBreakRule, ExitBreakRule, ResetNodePluginRule } from './plugins/Break';
import type { NormalizerRule } from './plugins/Normalizer';
import { TrackingPluginActions } from './plugins/Tracking';

export type CustomText = {
  text: string;
  [MARKS.BOLD]?: boolean;
  [MARKS.CODE]?: boolean;
  [MARKS.ITALIC]?: boolean;
  [MARKS.UNDERLINE]?: boolean;
  [MARKS.SUPERSCRIPT]?: boolean;
  [MARKS.SUBSCRIPT]?: boolean;
};

export type TextOrCustomElement = CustomElement | CustomText;

export type CustomElement<T = unknown> = {
  type: string;
  children: TextOrCustomElement[];
  data: T;
  isVoid?: boolean;
};

 @typescript-eslint/no-explicit-any -- TODO: explain this disable
export type CustomRenderElementProps<T = any, O = any> = Omit<RenderElementProps, 'element'> & {
  element: CustomElement<T>;
} & O;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface RichTextPlugin extends PlatePlugin<AnyObject, Value, RichTextEditor> {
  /**
   * @see createSoftBreakPlugin
   */
  softBreak?: SoftBreakRule[];

  /**
   * @see createExitBreakPlugin
   */
  exitBreak?: ExitBreakRule[];

  /**
   * @see createResetNodePlugin
   */
  resetNode?: ResetNodePluginRule[];

  /**
   * @see createNormalizerPlugin
   */
  normalizer?: NormalizerRule[];
}

export interface RichTextEditor extends PlateEditor<Value> {
  tracking: TrackingPluginActions;
}
