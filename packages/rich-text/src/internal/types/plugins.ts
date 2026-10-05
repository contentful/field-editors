import type * as React from 'react';

import type { QueryNodeOptions } from 'platejs';
import type { AnyPlatePlugin } from 'platejs/react';

import type { NormalizerRule } from '../../plugins/Normalizer';
import type { PlateEditor, BaseRange } from './editor';

export type HotkeyPlugin = { hotkey?: string | string[] };
export type SoftBreakRule = { hotkey: string; query?: QueryNodeOptions };
export type ExitBreakRule = SoftBreakRule & {
  before?: boolean;
  level?: number;
  query?: QueryNodeOptions & { start?: boolean; end?: boolean };
};
export type ResetNodePluginRule<E = PlateEditor> = {
  types: string[];
  defaultType?: string;
  hotkey?: string | string[];
  predicate: (editor: E) => boolean;
  onReset?: (editor: E) => void;
};

export type KeyboardHandler<P = Record<string, unknown>> = (
  editor: PlateEditor,
  plugin: PlatePlugin & { options: P },
) => (event: React.KeyboardEvent) => void | boolean;
export type WithOverride<P = Record<string, unknown>> = (
  editor: PlateEditor,
  plugin: PlatePlugin & { options: P },
) => PlateEditor;

/** Contentful's plugin configuration, translated to Plate at the editor boundary. */
export interface PlatePlugin {
  key: string;
  type?: string;
  isElement?: boolean;
  isLeaf?: boolean;
  isInline?: boolean;
  isVoid?: boolean;
  isMarkableVoid?: boolean;
  component?: React.ComponentType<any>;
  options?: any;
  basePlugin?: AnyPlatePlugin;
  preserveEditorMethods?: boolean;
  plugins?: PlatePlugin[];
  overrideByKey?: Record<string, Partial<PlatePlugin>>;
  handlers?: Record<
    string,
    (editor: PlateEditor, plugin: PlatePlugin & { options: any }) => (event: any) => unknown
  >;
  withOverrides?: WithOverride<any>;
  then?: (editor: PlateEditor, plugin: PlatePlugin) => Partial<PlatePlugin>;
  softBreak?: SoftBreakRule[];
  exitBreak?: ExitBreakRule[];
  resetNode?: ResetNodePluginRule[];
  normalizer?: NormalizerRule[];
  decorate?: (editor: PlateEditor) => (entry: any) => BaseRange[];
  deserializeHtml?: {
    withoutChildren?: boolean;
    rules?: any[];
    query?: (element: HTMLElement) => boolean;
    getNode?: (element: HTMLElement, node: any) => any;
  };
  inject?: {
    pluginsByKey?: Record<
      string,
      {
        editor?: {
          insertData?: {
            format?: string;
            transformData?: (data: string, options: { dataTransfer: DataTransfer }) => string;
          };
        };
      }
    >;
  };
}
