/**
 * Re-exporting Plate/Slate queries (aka selectors) to reduce
 * the blast radius of version upgrades
 */
import * as p from '@udecode/plate-common';
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
  Ancestor,
  BasePoint,
  Path,
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

export const getStartPoint = (editor: PlateEditor, at: Location) => {
  return p.getStartPoint(editor, at);
};

export const isNode = (value: unknown): value is Node => {
  return p.isNode(value);
};

export const isSelectionAtBlockEnd = (
  editor: PlateEditor,
  options?: p.GetAboveNodeOptions<Value>,
) => {
  return p.isSelectionAtBlockEnd(editor, options);
};

export const isSelectionAtBlockStart = (
  editor: PlateEditor,
  options?: p.GetAboveNodeOptions<Value>,
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

// TODO: Ancestor may not be the correct type for root
export const getNodeChildren = (
  root: Ancestor,
  path: Path,
  options?: s.NodeChildrenOptions | undefined,
) => {
  return p.getNodeChildren(root, path, options);
};

export const getParentNode = (
  editor: PlateEditor,
  at: Location,
  options?: s.EditorParentOptions,
) => {
  return p.getParentNode(editor, at, options) as NodeEntry | undefined;
};

export const someNode = (editor: PlateEditor, options: p.FindNodeOptions) => {
  return p.someNode(editor, options);
};

export const getChildren = (entry: NodeEntry) => {
  // Node.children crashes when given a text node
  if (s.Text.isText(entry[0])) {
    return [];
  }

  return p.getChildren(entry) as NodeEntry[];
};

export const isFirstChild = (path: Path) => {
  return p.isFirstChild(path);
};

export const getDescendantNodeByPath = (root: Node, path: s.Path): Node => {
  // @ts-expect-error
  return s.Node.get(root, path);
};

export const getNodeDescendants = (
  root: PlateEditor | Node,
  options?: s.NodeDescendantsOptions,
) => {
  return p.getNodeDescendants(root, { ...options, pass: undefined });
};

export const isRangeCollapsed = (range?: BaseRange) => {
  return p.isCollapsed(range);
};

// TODO: simplify
export const isRangeAcrossBlocks = (
  editor: p.TEditor<p.Value>,
  options?:
    | (Omit<p.GetAboveNodeOptions<p.Value>, 'at'> & { at?: s.BaseRange | null | undefined })
    | undefined,
) => {
  return p.isRangeAcrossBlocks(editor, options);
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

export const getRangeStart = (range: BaseRange) => {
  return s.Range.start(range);
};

export const getRangeEnd = (range: BaseRange) => {
  return s.Range.end(range);
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
  another: s.Path,
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
  },
) => {
  return p.getNodeTexts(root, opts);
};

export const findNode = (editor: PlateEditor, options?: p.FindNodeOptions<p.Value> | undefined) => {
  return p.findNode(editor, options);
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

export const isAncestorEmpty = (editor: PlateEditor, node: Ancestor) => {
  return p.isAncestorEmpty(editor, node);
};

export const getParentPath = (path: s.Path) => {
  return s.Path.parent(path);
};

export const getNextPath = (path: s.Path) => {
  return s.Path.next(path);
};

export const getPreviousPath = (path: s.Path) => {
  return s.Path.previous(path);
};

export const getLastChildPath = (nodeEntry: NodeEntry) => {
  return p.getLastChildPath(nodeEntry);
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

export const isLastChildPath = (entry: NodeEntry, childPath: s.Path) => {
  return p.isLastChild(entry, childPath);
};

export const isChildPath = (path: s.Path, another: s.Path) => {
  return s.Path.isChild(path, another);
};

export const matchNode = (node: Node, path: s.Path, fn: p.Predicate<PlateEditor | Node>) => {
  return p.match(node, path, fn);
};

export const someHtmlElement = (
  rootNode: globalThis.Node,
  predicate: (node: HTMLElement) => boolean,
) => {
  return p.someHtmlElement(rootNode, predicate);
};

export const getPointBefore = (
  editor: PlateEditor,
  at: Location,
  options?: s.EditorBeforeOptions,
) => {
  return p.getPointBefore(editor, at, options);
};

export const getPointAfter = (
  editor: PlateEditor,
  at: Location,
  options?: s.EditorAfterOptions,
) => {
  return p.getPointAfter(editor, at, options);
};

export const isEndPoint = (
  editor: PlateEditor,
  point: BasePoint | null | undefined,
  at: Location,
) => {
  return p.isEndPoint(editor, point, at);
};

export const isInline = (editor: PlateEditor, value: unknown) => {
  return p.isInline(editor, value);
};

export const queryNode = (entry?: NodeEntry, options?: p.QueryNodeOptions) => {
  return p.queryNode(entry, options);
};

export const getPluginType = (editor: PlateEditor, key: string) => {
  return p.getPluginType(editor, key);
};

export const createPathRef = (editor: PlateEditor, at: Path) => {
  return p.createPathRef(editor, at);
};

export const match = (obj: Node, path: Path, predicate?: p.Predicate<Node> | undefined) => {
  return p.match(obj, path, predicate);
};

export const getLastNodeByLevel = (editor: PlateEditor, level: number): NodeEntry | undefined => {
  return p.getLastNodeByLevel(editor, level);
};
