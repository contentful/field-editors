/**
 * https://platejs.org/docs/typescript
 */
import { MARKS } from '@contentful/rich-text-types';
import * as s from 'slate';
import { DOMRange as SlateReactDomRange } from 'slate-dom';
import * as sr from 'slate-react';
import type {
  SelectionMoveOptions as SlateSelectionMoveOptions,
  SelectionCollapseOptions as SlateSelectionCollapseOptions
} from 'slate/dist/interfaces/transforms/selection';
import type { TextInsertTextOptions as SlateTextInsertTextOptions } from 'slate/dist/interfaces/transforms/text';

import { TrackingPluginActions } from '../../plugins/Tracking';
import * as p from '../plate';

export interface Text extends p.TText {
  [MARKS.BOLD]?: boolean;
  [MARKS.CODE]?: boolean;
  [MARKS.ITALIC]?: boolean;
  [MARKS.UNDERLINE]?: boolean;
  [MARKS.SUPERSCRIPT]?: boolean;
  [MARKS.SUBSCRIPT]?: boolean;
  [MARKS.STRIKETHROUGH]?: boolean;
}

export interface Element extends p.TElement {
  type: string;
  data?: Record<string, unknown>;
  isVoid?: boolean;
  children: (Text | Element)[];
}

export type Value = Element[];
export type ReactEditor = PlateEditor;
export interface PlateEditor extends p.TPlateEditor<Value>, p.LegacyEditorMethods<Value> {
  contentfulPlugins: import('./plugins').PlatePlugin[];
  getCharacterCount: () => number;
  tracking: TrackingPluginActions;
  undo: {
    (): void;
    (source: 'toolbar' | 'shortcut'): void;
  };
  redo: {
    (): void;
    (source: 'toolbar' | 'shortcut'): void;
  };
}

export type Node = p.ElementOf<PlateEditor> | p.TextOf<PlateEditor>;
export type Path = s.Path;
export type NodeEntry<T extends Node = Node> = p.NodeEntry<T>;
export type NodeMatch = p.Predicate<Node>;
export type Ancestor = p.AncestorOf<PlateEditor>;
export type Descendant = p.DescendantOf<PlateEditor>;
export type Operation = p.Operation;
export type Location = p.TLocation;
export type BaseRange = p.TRange;
export type ToggleNodeTypeOptions = p.ToggleNodeTypeOptions;
export type EditorNodesOptions = Omit<p.GetNodeEntriesOptions<Value>, 'match'>;
export type SelectionMoveOptions = SlateSelectionMoveOptions;
export type TextInsertTextOptions = SlateTextInsertTextOptions;
export type SelectionCollapseOptions = SlateSelectionCollapseOptions;
export type RenderLeafProps = sr.RenderLeafProps;
export type RenderElementProps = sr.RenderElementProps;
export type Span = p.TSpan;
export type BasePoint = s.BasePoint;
export type BaseSelection = s.BaseSelection;
export type PathRef = s.PathRef;
export type DOMRange = SlateReactDomRange;

export const Range = s.Range;
