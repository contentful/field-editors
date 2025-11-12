import { BLOCKS } from '@contentful/rich-text-types';
import { NodeEntry, PlateEditor, Element } from '../../internal/types';
export declare const hasListAsDirectParent: (editor: PlateEditor, [, path]: NodeEntry) => boolean;
/**
 * Places orphaned list items in a list. If there's a list somewhere
 * in the node's ancestors, defaults to that list type, else places
 * the list item in an unordered list.
 */
export declare const normalizeOrphanedListItem: (editor: PlateEditor, [, path]: NodeEntry) => void;
export declare const isNonEmptyListItem: (_: PlateEditor, entry: NodeEntry) => boolean;
export declare const firstNodeIsNotList: (_editor: PlateEditor, [node]: NodeEntry<Element>) => boolean;
export declare const insertParagraphAsChild: (editor: PlateEditor, [, path]: NodeEntry) => void;
export declare const replaceNodeWithListItems: (editor: PlateEditor, entry: NodeEntry<Element>) => void;
export declare const isListTypeActive: (editor: PlateEditor, type: BLOCKS) => boolean;
