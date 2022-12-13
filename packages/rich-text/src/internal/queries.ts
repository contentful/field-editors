/**
 * Re-exporting Plate/Slate queries (aka selectors) to reduce
 * the blast radius of version upgrades
 */
import * as p from '@udecode/plate-core';
import * as s from 'slate';

import type {
  Value,
  PlateEditor,
  Location,
  Node,
  NodeEntry,
  BaseRange,
  Element,
  Text,
} from './types';

/**
 * Get text content at location
 */
export const getText = (editor: PlateEditor, at?: Location) => {
  return p.getEditorString(editor, at);
};

export const isText = (value: unknown): value is Text => {
  return p.isText(value);
};

export const getEndPoint = (editor: PlateEditor, at: Location) => {
  return p.getEndPoint(editor, at);
};

export const isNode = (value: unknown): value is Node => {
  return p.isNode(value);
};

export const isSelectionAtBlockEnd = (
  editor: PlateEditor,
  options?: p.GetAboveNodeOptions<Value>
) => {
  return p.isSelectionAtBlockEnd(editor, options);
};

export const isSelectionAtBlockStart = (
  editor: PlateEditor,
  options?: p.GetAboveNodeOptions<Value>
) => {
  return p.isSelectionAtBlockStart(editor, options);
};

export const getBlockAbove = (editor: PlateEditor, options?: p.GetAboveNodeOptions<p.Value>) => {
  return p.getBlockAbove(editor, options);
};

export const getNodeEntry = (editor: PlateEditor, at: Location, options?: s.EditorNodeOptions) => {
  return p.getNodeEntry(editor, at, options);
};

export const getNodeEntries = (editor: PlateEditor, options?: p.GetNodeEntriesOptions) => {
  return p.getNodeEntries(editor, options);
};

export const getParentNode = (
  editor: PlateEditor,
  at: Location,
  options?: s.EditorParentOptions
) => {
  return p.getParentNode(editor, at, options);
};

export const getChildren = (root: PlateEditor | Node, path: s.Path) => {
  return Array.from(s.Node.children(root as any, path)) as NodeEntry[];
};

export const getDescendantNodeByPath = (root: Node, path: s.Path): Node => {
  // @ts-expect-error
  return s.Node.get(root, path);
};

export const getNodeDescendants = (
  root: PlateEditor | Node,
  options?: s.NodeDescendantsOptions
) => {
  return p.getNodeDescendants(root, { ...options, pass: undefined });
};

export const isRangeCollapsed = (range?: BaseRange) => {
  return p.isCollapsed(range);
};

export const isRangeExpanded = (range?: BaseRange) => {
  return p.isExpanded(range);
};

export const getRange = (editor: PlateEditor, at: Location, to?: Location) => {
  return p.getRange(editor, at, to);
};

export const getRangeEdges = (range: BaseRange) => {
  return s.Range.edges(range);
};

export const getAboveNode = (editor: PlateEditor, opts?: p.GetAboveNodeOptions<Value>) => {
  return p.getAboveNode(editor, opts) as NodeEntry | undefined;
};

export const getNextNode = (editor: PlateEditor, opts?: p.GetNextNodeOptions<Value>) => {
  return p.getNextNode(editor, opts) as NodeEntry | undefined;
};

export const getCommonNode = (
  root: PlateEditor | Node,
  path: s.Path,
  another: s.Path
): NodeEntry => {
  return p.getCommonNode(root, path, another);
};

export const getNodeTexts = (
  root: Node,
  opts?: {
    from?: s.Path;
    to?: s.Path;
    pass?: (ne: NodeEntry) => boolean;
    reverse?: boolean;
  }
) => {
  return p.getNodeTexts(root, opts);
};

export const isMarkActive = (editor: PlateEditor, type: string) => {
  return p.isMarkActive(editor, type);
};

export const getMarks = (editor: PlateEditor) => {
  return p.getMarks(editor);
};

export const isEditor = (value: unknown): value is PlateEditor => {
  return p.isEditor(value);
};

export const isEditorReadOnly = (editor: PlateEditor) => {
  return p.isEditorReadOnly(editor);
};

export const isElement = (value: unknown): value is Element => {
  return p.isElement(value);
};

export const isBlockNode = (editor: PlateEditor, value: unknown): value is Element => {
  return p.isBlock(editor, value);
};

export const findNodePath = (editor: PlateEditor, node: Node) => {
  return p.findNodePath(editor, node);
};

export const isAncestorPath = (path: s.Path, another: s.Path) => {
  return s.Path.isAncestor(path, another);
};

export const isAncestorEmpty = (editor: PlateEditor, node: p.TAncestor) => {
  return p.isAncestorEmpty(editor, node);
};

export const getParentPath = (path: s.Path) => {
  return s.Path.parent(path);
};

export const getNextPath = (path: s.Path) => {
  return s.Path.next(path);
};

export const getPathLevels = (path: s.Path, options?: s.PathLevelsOptions) => {
  return s.Path.levels(path, options);
};

export const isCommonPath = (path: s.Path, anotherPath: s.Path) => {
  return s.Path.isCommon(path, anotherPath);
};

export const isFirstChildPath = (path: s.Path) => {
  return p.isFirstChild(path);
};

export const isChildPath = (path: s.Path, another: s.Path) => {
  return s.Path.isChild(path, another);
};
