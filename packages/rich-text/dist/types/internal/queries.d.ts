/**
 * Re-exporting Plate/Slate queries (aka selectors) to reduce
 * the blast radius of version upgrades
 */
import * as p from '@udecode/plate-common';
import * as s from 'slate';
import type { Value, PlateEditor, Location, Node, NodeEntry, BaseRange, Element, Text, Ancestor, BasePoint, Path } from './types';
/**
 * Get text content at location
 */
export declare const getText: (editor: PlateEditor, at?: Location) => string;
export declare const isText: (value: unknown) => value is Text;
export declare const getEndPoint: (editor: PlateEditor, at: Location) => s.BasePoint;
export declare const getStartPoint: (editor: PlateEditor, at: Location) => s.BasePoint;
export declare const isNode: (value: unknown) => value is Node;
export declare const isSelectionAtBlockEnd: (editor: PlateEditor, options?: p.GetAboveNodeOptions<Value>) => boolean;
export declare const isSelectionAtBlockStart: (editor: PlateEditor, options?: p.GetAboveNodeOptions<Value>) => boolean;
export declare const getBlockAbove: (editor: PlateEditor, options?: p.GetAboveNodeOptions<p.Value>) => p.TNodeEntry<p.TElement | p.TEditor<p.Value>> | undefined;
export declare const getNodeEntry: (editor: PlateEditor, at: Location, options?: s.EditorNodeOptions) => p.TNodeEntry<p.ENode<Value>> | undefined;
export declare const getNodeEntries: (editor: PlateEditor, options?: p.GetNodeEntriesOptions) => Generator<p.TNodeEntry<p.ENode<p.Value>>, void, undefined>;
export declare const getNodeChildren: (root: Ancestor, path: s.Path, options?: s.NodeChildrenOptions | undefined) => Generator<p.TNodeEntry<Text | Element | p.TDescendant>, void, undefined>;
export declare const getParentNode: (editor: PlateEditor, at: Location, options?: s.EditorParentOptions) => NodeEntry | undefined;
export declare const someNode: (editor: PlateEditor, options: p.FindNodeOptions) => boolean;
export declare const getChildren: (entry: NodeEntry) => NodeEntry[];
export declare const isFirstChild: (path: s.Path) => boolean;
export declare const getDescendantNodeByPath: (root: Node, path: s.Path) => Node;
export declare const getNodeDescendants: (root: PlateEditor | Node, options?: s.NodeDescendantsOptions) => Generator<p.TNodeEntry<p.TText | Element | p.TElement>, void, undefined>;
export declare const isRangeCollapsed: (range?: BaseRange) => boolean;
export declare const isRangeAcrossBlocks: (editor: p.TEditor<p.Value>, options?: (Omit<p.GetAboveNodeOptions<p.Value>, 'at'> & {
    at?: s.BaseRange | null | undefined;
}) | undefined) => boolean | undefined;
export declare const isRangeExpanded: (range?: BaseRange) => boolean;
export declare const getRange: (editor: PlateEditor, at: Location, to?: Location) => s.BaseRange;
export declare const getRangeEdges: (range: BaseRange) => [s.BasePoint, s.BasePoint];
export declare const getRangeStart: (range: BaseRange) => s.BasePoint;
export declare const getRangeEnd: (range: BaseRange) => s.BasePoint;
export declare const getAboveNode: (editor: PlateEditor, opts?: p.GetAboveNodeOptions<Value>) => NodeEntry | undefined;
export declare const getNextNode: (editor: PlateEditor, opts?: p.GetNextNodeOptions<Value>) => NodeEntry | undefined;
export declare const getCommonNode: (root: PlateEditor | Node, path: s.Path, another: s.Path) => NodeEntry;
export declare const getNodeTexts: (root: Node, opts?: {
    from?: s.Path | undefined;
    to?: s.Path | undefined;
    pass?: ((ne: NodeEntry) => boolean) | undefined;
    reverse?: boolean | undefined;
} | undefined) => Generator<p.TNodeEntry<p.TText>, void, undefined>;
export declare const findNode: (editor: PlateEditor, options?: p.FindNodeOptions<p.Value> | undefined) => p.TNodeEntry<p.ENode<p.Value>> | undefined;
export declare const isMarkActive: (editor: PlateEditor, type: string) => boolean;
export declare const getMarks: (editor: PlateEditor) => {
    [x: string]: unknown;
    [x: number]: unknown;
} | null;
export declare const isEditor: (value: unknown) => value is PlateEditor;
export declare const isEditorReadOnly: (editor: PlateEditor) => boolean;
export declare const isElement: (value: unknown) => value is Element;
export declare const isBlockNode: (editor: PlateEditor, value: unknown) => value is Element;
export declare const findNodePath: (editor: PlateEditor, node: Node) => s.Path | undefined;
export declare const isAncestorPath: (path: s.Path, another: s.Path) => boolean;
export declare const isAncestorEmpty: (editor: PlateEditor, node: Ancestor) => boolean;
export declare const getParentPath: (path: s.Path) => s.Path;
export declare const getNextPath: (path: s.Path) => s.Path;
export declare const getPreviousPath: (path: s.Path) => s.Path;
export declare const getLastChildPath: (nodeEntry: NodeEntry) => s.Path;
export declare const getPathLevels: (path: s.Path, options?: s.PathLevelsOptions) => s.Path[];
export declare const isCommonPath: (path: s.Path, anotherPath: s.Path) => boolean;
export declare const isFirstChildPath: (path: s.Path) => boolean;
export declare const isLastChildPath: (entry: NodeEntry, childPath: s.Path) => boolean;
export declare const isChildPath: (path: s.Path, another: s.Path) => boolean;
export declare const matchNode: (node: Node, path: s.Path, fn: p.Predicate<PlateEditor | Node>) => boolean;
export declare const someHtmlElement: (rootNode: globalThis.Node, predicate: (node: HTMLElement) => boolean) => boolean;
export declare const getPointBefore: (editor: PlateEditor, at: Location, options?: s.EditorBeforeOptions) => s.BasePoint | undefined;
export declare const getPointAfter: (editor: PlateEditor, at: Location, options?: s.EditorAfterOptions) => s.BasePoint | undefined;
export declare const isEndPoint: (editor: PlateEditor, point: BasePoint | null | undefined, at: Location) => boolean;
export declare const isInline: (editor: PlateEditor, value: unknown) => boolean;
export declare const queryNode: (entry?: NodeEntry, options?: p.QueryNodeOptions) => boolean;
export declare const getPluginType: (editor: PlateEditor, key: string) => string;
export declare const createPathRef: (editor: PlateEditor, at: s.Path) => s.PathRef;
export declare const match: (obj: Node, path: s.Path, predicate?: p.Predicate<Node> | undefined) => boolean;
export declare const getLastNodeByLevel: (editor: PlateEditor, level: number) => NodeEntry | undefined;
