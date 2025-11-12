import { Link } from '@contentful/field-editor-reference';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { EditorNodesOptions, ToggleNodeTypeOptions, Node, Path } from '../internal/types';
import { Element, PlateEditor } from '../internal/types';
export declare const LINK_TYPES: INLINES[];
export declare function isBlockSelected(editor: PlateEditor, type: string): boolean;
export declare function isRootLevel(path: Path): boolean;
type NodeEntry = [Element, Path];
type NodeType = BLOCKS | INLINES;
export declare function getNodeEntryFromSelection(editor: PlateEditor, nodeTypeOrTypes: NodeType | NodeType[], path?: Path): NodeEntry | [];
export declare function isNodeTypeSelected(editor: PlateEditor | null, nodeType: BLOCKS | INLINES): boolean;
export declare function moveToTheNextLine(editor: PlateEditor): void;
export declare function moveToTheNextChar(editor: PlateEditor): void;
export declare function insertEmptyParagraph(editor: PlateEditor, options?: any): void;
export declare function getElementFromCurrentSelection(editor: PlateEditor): (import("slate").Path | Node)[];
export declare function isList(editor?: PlateEditor): boolean;
export declare function getTableSize(table: Element): Record<'numRows' | 'numColumns', number> | null;
interface InsertLinkOptions {
    text: string;
    type: INLINES.HYPERLINK | INLINES.ENTRY_HYPERLINK | INLINES.RESOURCE_HYPERLINK | INLINES.ASSET_HYPERLINK;
    url?: string;
    target?: Link;
    path?: Path;
}
export declare function insertLink(editor: any, options: InsertLinkOptions): void;
export declare function isLinkActive(editor?: PlateEditor | null): boolean;
export declare function unwrapLink(editor: any): void;
export declare function wrapLink(editor: any, { text, url, target, type, path }: InsertLinkOptions): void;
export declare function getAncestorPathFromSelection(editor: PlateEditor): import("slate").Path | undefined;
export declare const isAtEndOfTextSelection: (editor: PlateEditor) => boolean;
/**
 * This traversal strategy is unfortunately necessary because Slate doesn't
 * expose something like Node.next(editor).
 */
export declare function getNextNode(editor: PlateEditor): Element | null;
export declare const INLINE_TYPES: string[];
export declare const isInlineOrText: (node: Node) => boolean;
export declare const focus: (editor: PlateEditor) => void;
export declare function toggleElement(editor: PlateEditor, options: ToggleNodeTypeOptions, editorOptions?: EditorNodesOptions): void;
export {};
