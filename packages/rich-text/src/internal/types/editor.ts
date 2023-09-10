/**
 * https://plate.udecode.io/docs/typescript
 */
import { MARKS } from '@contentful/rich-text-types';
import * as p from '@udecode/plate-common';
import * as s from 'slate';
import * as sr from 'slate-react';
// TODO fix me
// import {
//   SelectionMoveOptions as SlateSelectionMoveOptions,
//   SelectionCollapseOptions as SlateSelectionCollapseOptions,
// } from 'slate';
// import { TextInsertTextOptions as SlateTextInsertTextOptions } from 'slate';

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
export type SelectionMoveOptions = any;
export type TextInsertTextOptions = any;
export type SelectionCollapseOptions = any;
export type HotkeyPlugin = p.HotkeyPlugin;
export type RenderLeafProps = sr.RenderLeafProps;
export type RenderElementProps = sr.RenderElementProps;
export type Span = p.TSpan;
export type BasePoint = s.BasePoint;
export type BaseSelection = s.BaseSelection;
export type PathRef = s.PathRef;
