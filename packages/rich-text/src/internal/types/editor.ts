/**
 * https://plate.udecode.io/docs/typescript
 */
import { MARKS } from '@contentful/rich-text-types';
import * as p from '@udecode/plate-core';

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
export type NodeEntry = p.TNodeEntry<Node>;
export type NodeMatch = p.ENodeMatch<Node>;
export type Descendant = p.DescendantOf<PlateEditor>;
export type Operation = p.TOperation<Descendant>;
export type Location = p.TLocation;
export type Path = p.TPath;
export type Range = p.TRange;
