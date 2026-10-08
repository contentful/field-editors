/** Domain-facing operations shared by Contentful's editor plugins. */
import * as p from 'platejs';
import { Editor as SlateEditor } from 'slate';

import type { PlateEditor as ContentfulEditor } from './types/editor';

export * from 'platejs';
export {
  Plate,
  PlateContent,
  useEditorRef,
  useEditorState,
  usePlateEditor,
  usePlateSet,
  useEditorValue,
  createPlatePlugin,
} from 'platejs/react';
export type { TPlateEditor, PlateContentProps, PlateProps } from 'platejs/react';
export { createPlateEditor, mockPlugin } from './pluginAdapter';
export type { CreatePlateEditorOptions } from './pluginAdapter';
export type { PlatePlugin, KeyboardHandler, HotkeyPlugin, WithOverride } from './types/plugins';
export type PlateEditor<V extends p.Value = p.Value> = import('platejs/react').TPlateEditor<V>;
export type TEditor<V extends p.Value = p.Value> = p.Editor<V>;
export type PluginOptions = Record<string, unknown>;
export type GetAboveNodeOptions<V extends p.Value = p.Value> = p.EditorAboveOptions<V>;
export type GetNextNodeOptions<V extends p.Value = p.Value> = p.EditorNextOptions<V>;
export type GetNodeEntriesOptions<V extends p.Value = p.Value> = p.EditorNodesOptions<V>;
export type FindNodeOptions<V extends p.Value = p.Value> = p.EditorNodesOptions<V>;
export type ToggleMarkOptions = p.ToggleMarkOptions & { key: string; clear?: string | string[] };
export type ToggleNodeTypeOptions = { activeType: string; inactiveType?: string };
export type UnhangRangeOptions = p.EditorUnhangRangeOptions;
export type SelectEditorOptions = { at?: p.Location; focus?: boolean; edge?: 'start' | 'end' };
export type MoveChildrenOptions = {
  at: p.Path;
  to: p.Path;
  fromStartIndex?: number;
  match?: p.Predicate<p.Node>;
};
export const ELEMENT_DEFAULT = 'p';
export const KEY_DESERIALIZE_HTML = 'html';
export const getTEditor = (editor: ContentfulEditor) => editor;
export const getPluginType = (editor: ContentfulEditor, key: string) => editor.getType(key);
export const getEditorString = (editor: ContentfulEditor, at?: p.Location) => editor.api.string(at);
export const getNodeEntry = (
  editor: ContentfulEditor,
  at: p.Location,
  options?: p.EditorNodeOptions,
) => editor.api.node(at, options);
export const getNodeEntries = (editor: ContentfulEditor, options?: p.EditorNodesOptions) =>
  editor.api.nodes(options);
export const getAboveNode = (editor: ContentfulEditor, options?: p.EditorAboveOptions) =>
  editor.api.above(options);
export const getBlockAbove = (editor: ContentfulEditor, options?: p.EditorAboveOptions) =>
  editor.api.block({ ...options, above: true });
export const findNode = (editor: ContentfulEditor, options?: p.EditorNodesOptions) =>
  editor.api.nodes(options ?? {}).next().value;
export const someNode = (editor: ContentfulEditor, options?: p.EditorNodesOptions) =>
  editor.api.some(options ?? {});
export const getNextNode = (editor: ContentfulEditor, options?: p.EditorNextOptions) =>
  editor.api.next(options);
export const isSelectionAtBlockEnd = (editor: ContentfulEditor, options?: p.EditorAboveOptions) => {
  const block = editor.api.block({ ...options, above: true });
  return !!editor.selection && !!block && editor.api.isEnd(editor.selection.focus, block[1]);
};
export const isSelectionAtBlockStart = (
  editor: ContentfulEditor,
  options?: p.EditorAboveOptions,
) => {
  const block = editor.api.block({ ...options, above: true });
  return !!editor.selection && !!block && editor.api.isStart(editor.selection.anchor, block[1]);
};
export const isRangeAcrossBlocks = (editor: p.Editor, options?: { at?: p.Range | null }) =>
  editor.api.isAt({ at: options?.at, blocks: true });
export const isMarkActive = (editor: ContentfulEditor, key: string) => editor.api.hasMark(key);
export const isEditorReadOnly = (editor: ContentfulEditor) => editor.api.isReadOnly();
export const isAncestorEmpty = (editor: ContentfulEditor, node: p.Ancestor) =>
  editor.api.isEmpty(node);
export const isEndPoint = (
  editor: ContentfulEditor,
  point: p.Point | null | undefined,
  at: p.Location,
) => !!point && editor.api.isEnd(point, at);
export const isNode = p.NodeApi.isNode;
export const isText = p.TextApi.isText;
export const isElement = p.ElementApi.isElement;
export const isEditor = SlateEditor.isEditor;
export const isCollapsed = p.RangeApi.isCollapsed;
export const isExpanded = p.RangeApi.isExpanded;
export const getNodeChildren = p.NodeApi.children;
export const getNodeDescendants = p.NodeApi.descendants;
export const getNodeTexts = p.NodeApi.texts;
export const getCommonNode = (root: p.Node, path: p.Path, another: p.Path) =>
  p.NodeApi.common(root, path, another)!;
export const getChildren = ([node, path]: p.NodeEntry) =>
  Array.from(p.NodeApi.children(node, [])).map(
    ([child, childPath]) => [child, path.concat(childPath)] as p.NodeEntry,
  );
export const isFirstChild = (path: p.Path) => path[path.length - 1] === 0;
export const isLastChild = ([parent, path]: p.NodeEntry, childPath: p.Path) =>
  p.ElementApi.isElement(parent) &&
  p.PathApi.equals(childPath, path.concat(parent.children.length - 1));
export const hasSingleChild = (node: p.Node) =>
  p.ElementApi.isElement(node) && node.children.length === 1;
export const getLastChildPath = ([node, path]: p.NodeEntry) =>
  path.concat((node as p.Element).children.length - 1);
export const getLastNodeByLevel = (editor: ContentfulEditor, level: number) =>
  editor.api.last([], { level });
export const normalizeEditor = (editor: ContentfulEditor, options?: p.EditorNormalizeOptions) =>
  editor.tf.normalize(options);
export const withoutNormalizing = (editor: ContentfulEditor, fn: () => void) =>
  editor.tf.withoutNormalizing(fn);
export const focusEditor = (editor: ContentfulEditor, target?: p.Location) => {
  if (target) editor.tf.select(target);
  editor.tf.focus();
};
export const blurEditor = (editor: ContentfulEditor) => editor.tf.blur();
export const selectEditor = (
  editor: ContentfulEditor,
  { at, edge, focus }: SelectEditorOptions = {},
) => {
  if (at) editor.tf.select(at);
  if (edge) editor.tf.collapse({ edge });
  if (focus) editor.tf.focus();
};
export const toSlatePoint = (
  editor: ContentfulEditor,
  point: [Node, number],
  options: { exactMatch: boolean; suppressThrow: boolean },
) => editor.api.toSlatePoint(point, options);
export const toggleNodeType = (
  editor: ContentfulEditor,
  { activeType, inactiveType = ELEMENT_DEFAULT }: ToggleNodeTypeOptions,
  options?: p.EditorNodesOptions,
) => editor.tf.toggleBlock(activeType, { defaultType: inactiveType, someOptions: options });
export const removeMark = (editor: ContentfulEditor, { key, at }: { key: string; at?: p.Range }) =>
  editor.tf.removeMarks(key, { at });
export const toggleMark = (
  editor: ContentfulEditor,
  options: p.ToggleMarkOptions & { key: string; clear?: string | string[] },
) => editor.tf.toggleMark(options.key, { remove: options.clear ?? options.remove });
export const moveChildren = (
  editor: ContentfulEditor,
  { at, to, fromStartIndex = 0, match }: MoveChildrenOptions,
) => {
  const children = Array.from(p.NodeApi.children(editor, at))
    .slice(fromStartIndex)
    .filter(([node, path]) => !match || p.match(node, path, match));
  const refs = children.map(([, path]) => editor.api.pathRef(path));
  let count = 0;
  for (const ref of refs) {
    const path = ref.unref();
    if (path) {
      editor.tf.moveNodes({ at: path, to: [...to.slice(0, -1), to[to.length - 1] + count] });
      count++;
    }
  }
  return count;
};
export const getEndPoint = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['end']>
) => editor.api.end(...args);
export const getStartPoint = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['start']>
) => editor.api.start(...args);
export const getParentNode = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['parent']>
) => editor.api.parent(...args);
export const getRange = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['range']>
) => editor.api.range(...args)!;
export const getMarks = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['marks']>
) => editor.api.marks(...args);
export const findNodePath = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['findPath']>
) => editor.api.findPath(...args);
export const getPointBefore = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['before']>
) => editor.api.before(...args);
export const getPointAfter = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['after']>
) => editor.api.after(...args);
export const isBlock = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['isBlock']>
) => editor.api.isBlock(...args);
export const isInline = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['isInline']>
) => editor.api.isInline(...args);
export const createPathRef = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['pathRef']>
) => editor.api.pathRef(...args);
export const setSelection = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['setSelection']>
) => editor.tf.setSelection(...args);
export const select = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['select']>
) => editor.tf.select(...args);
export const moveSelection = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['move']>
) => editor.tf.move(...args);
export const collapseSelection = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['collapse']>
) => editor.tf.collapse(...args);
export const setNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['setNodes']>
) => editor.tf.setNodes(...args);
export const unsetNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['unsetNodes']>
) => editor.tf.unsetNodes(...args);
export const insertNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['insertNodes']>
) => editor.tf.insertNodes(...args);
export const splitNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['splitNodes']>
) => editor.tf.splitNodes(...args);
export const liftNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['liftNodes']>
) => editor.tf.liftNodes(...args);
export const unwrapNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['unwrapNodes']>
) => editor.tf.unwrapNodes(...args);
export const wrapNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['wrapNodes']>
) => editor.tf.wrapNodes(...args);
export const addMark = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['addMark']>
) => editor.tf.addMark(...args);
export const insertText = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['insertText']>
) => editor.tf.insertText(...args);
export const deleteText = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['delete']>
) => editor.tf.delete(...args);
export const removeNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['removeNodes']>
) => editor.tf.removeNodes(...args);
export const moveNodes = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['moveNodes']>
) => editor.tf.moveNodes(...args);
export const deleteFragment = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['tf']['deleteFragment']>
) => editor.tf.deleteFragment(...args);
export const unhangRange = (
  editor: ContentfulEditor,
  ...args: Parameters<ContentfulEditor['api']['unhangRange']>
) => editor.api.unhangRange(...args);

export const isBlockAboveEmpty = (editor: ContentfulEditor) => {
  const block = editor.api.block();
  return !!block && editor.api.isEmpty(block[0]);
};
