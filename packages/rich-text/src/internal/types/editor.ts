/**
 * https://plate.udecode.io/docs/typescript
 */
import { MARKS } from '@contentful/rich-text-types';
import * as p from '@udecode/plate-core';
import * as s from 'slate';

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
export interface Editor extends p.PlateEditor<Value> {
  tracking: TrackingPluginActions;
}

export type ReactEditor = p.TReactEditor<Value>;
export type Node = p.ElementOf<Editor> | p.TextOf<Editor>;
export type NodeEntry = p.TNodeEntry<Node>;
export type Descendant = p.DescendantOf<Editor>;
export type Location = s.Location;
