/**
 * https://plate.udecode.io/docs/typescript
 */
import { MARKS } from '@contentful/rich-text-types';
import * as p from '@udecode/plate-core';
import * as s from 'slate';
import * as sr from 'slate-react';
import {
  SelectionMoveOptions as SlateSelectionMoveOptions,
  SelectionCollapseOptions as SlateSelectionCollapseOptions,
} from 'slate/dist/transforms/selection';
import { TextInsertTextOptions as SlateTextInsertTextOptions } from 'slate/dist/transforms/text';

import { TrackingPluginActions } from '../../plugins/Tracking';

export interface Text extends p.TText {
  [MARKS.BOLD]?: boolean;
  [MARKS.CODE]?: boolean;
  [MARKS.ITALIC]?: boolean;
  [MARKS.UNDERLINE]?: boolean;
  [MARKS.SUPERSCRIPT]?: boolean;
  [MARKS.SUBSCRIPT]?: boolean;
}

export interface Element extends p.TElement {
  type: string;
  data?: Record<string, unknown>;
  isVoid?: boolean;
  children: (Text | Element)[];
}

export type Value = Element[];
export type ReactEditor = p.TReactEditor<Value>;
export interface PlateEditor extends p.PlateEditor<Value> {
  tracking: TrackingPluginActions;
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: explain this disable
export type CustomRenderElementProps<T = any, O = any> = Omit<RenderElementProps, 'element'> & {
  element: CustomElement<T>;
} & O;

export type Node = p.ElementOf<PlateEditor> | p.TextOf<PlateEditor>;
export type Path = p.TPath;
export type NodeEntry<T extends Node = Node> = p.TNodeEntry<T>;
export type NodeMatch = p.ENodeMatch<Node>;
export type Ancestor = p.AncestorOf<PlateEditor>;
export type Descendant = p.DescendantOf<PlateEditor>;
export type Operation = p.TOperation<Descendant>;
export type Location = p.TLocation;
export type BaseRange = p.TRange;
export type ToggleNodeTypeOptions = p.ToggleNodeTypeOptions;
export type EditorNodesOptions = Omit<p.GetNodeEntriesOptions<Value>, 'match'>;
export type WithOverride<P = p.AnyObject> = p.WithOverride<P, Value, PlateEditor>;
export type SelectionMoveOptions = SlateSelectionMoveOptions;
export type TextInsertTextOptions = SlateTextInsertTextOptions;
export type SelectionCollapseOptions = SlateSelectionCollapseOptions;
export type HotkeyPlugin = p.HotkeyPlugin;
export type RenderLeafProps = sr.RenderLeafProps;
export type RenderElementProps = sr.RenderElementProps;
export type Span = p.TSpan;
export type BasePoint = s.BasePoint;
export type BaseSelection = s.BaseSelection;
export type PathRef = s.PathRef;
