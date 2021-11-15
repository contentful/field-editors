import { Text, Editor, Element, Transforms, Path, Range, Node } from 'slate';
import { BLOCKS, INLINES, TABLE_BLOCKS } from '@contentful/rich-text-types';
import { CustomElement } from '../types';
import { Link } from '@contentful/field-editor-reference/dist/types';
import { PlateEditor } from '@udecode/plate-core';
import { getText } from '@udecode/plate-common';

export const LINK_TYPES: INLINES[] = [
  INLINES.HYPERLINK,
  INLINES.ENTRY_HYPERLINK,
  INLINES.ASSET_HYPERLINK,
];
const LIST_TYPES: BLOCKS[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];

export function isBlockSelected(editor, type: string): boolean {
  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (node) => Element.isElement(node) && (node as CustomElement).type === type,
    })
  );
  return !!match;
}

export function isVoid(editor, element): boolean {
  const { isVoid: originalIsVoid } = editor;

  return element.isVoid || originalIsVoid(element);
}

export function hasSelectionText(editor) {
  return editor.selection
    ? Editor.node(editor, editor.selection.focus.path).some(
        (node) => Text.isText(node) && node.text !== ''
      )
    : false;
}

type NodeEntry = [CustomElement, Path];
type NodeType = BLOCKS | INLINES;
export function getNodeEntryFromSelection(
  editor,
  nodeTypeOrTypes: NodeType | NodeType[]
): NodeEntry | [] {
  if (!editor.selection) return [];
  const nodeTypes = Array.isArray(nodeTypeOrTypes) ? nodeTypeOrTypes : [nodeTypeOrTypes];
  const { path } = editor.selection.focus;
  for (let i = 0; i < path.length; i++) {
    const nodeEntry = Editor.node(editor, path.slice(0, i + 1)) as NodeEntry;
    if (nodeTypes.includes(nodeEntry[0].type as NodeType)) return nodeEntry;
  }
  return [];
}

export function isNodeTypeSelected(editor, nodeType: BLOCKS | INLINES): boolean {
  if (!editor) return false;
  const [node] = getNodeEntryFromSelection(editor, nodeType);
  return !!node;
}

export function moveToTheNextLine(editor) {
  Transforms.move(editor, { distance: 1, unit: 'line' });
}

export function moveToThePreviousLine(editor) {
  Transforms.move(editor, { distance: 1, unit: 'line', reverse: true });
}

export function toggleBlock(editor, type: string): void {
  const isActive = isBlockSelected(editor, type);
  const isList = LIST_TYPES.includes(type as BLOCKS);
  const isQuote = type === BLOCKS.QUOTE;

  Transforms.unwrapNodes(editor, {
    match: (node) => {
      if (Editor.isEditor(node) || !Element.isElement(node)) {
        return false;
      }

      // Lists
      if (isList && LIST_TYPES.includes((node as CustomElement).type as BLOCKS)) {
        return true;
      }

      // Quotes
      if (isQuote && (node as CustomElement).type === BLOCKS.QUOTE) {
        return true;
      }

      return false;
    },
    split: true,
  });
  const newProperties: Partial<CustomElement> = {
    type: isActive
      ? BLOCKS.PARAGRAPH
      : isList
      ? BLOCKS.LIST_ITEM
      : isQuote
      ? BLOCKS.PARAGRAPH
      : type,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && (isList || isQuote)) {
    const block = {
      type,
      data: {},
      children: [],
    };
    Transforms.wrapNodes(editor, block);
  }
}

export function getElementFromCurrentSelection(editor) {
  if (!editor.selection) return [];

  return Array.from(
    Editor.nodes(editor, {
      at: editor.selection.focus,
      match: (node) => Element.isElement(node),
    })
  ).flat();
}

export function isList(editor) {
  const element = getElementFromCurrentSelection(editor);

  return element.some(
    (element) =>
      Element.isElement(element) && LIST_TYPES.includes((element as CustomElement).type as BLOCKS)
  );
}

export function getTableSize(
  table: CustomElement
): Record<'numRows' | 'numColumns', number> | null {
  const numRows = table.children.length;
  if (!numRows) return null;
  const [firstRow] = table.children;
  const numColumns = (firstRow as CustomElement).children?.length;
  return { numRows, numColumns };
}

export function isFirstChild(path: Path) {
  return path[path.length - 1] === 0;
}

interface InsertLinkOptions {
  text: string;
  type: INLINES.HYPERLINK | INLINES.ENTRY_HYPERLINK | INLINES.ASSET_HYPERLINK;
  url?: string;
  target?: Link;
  path?: Path;
}

export function insertLink(editor, options: InsertLinkOptions) {
  if (editor.selection) {
    wrapLink(editor, options);
  }
}

export function isLinkActive(editor) {
  const [link] = Array.from(
    Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        Element.isElement(node) &&
        LINK_TYPES.includes((node as CustomElement).type as INLINES),
    })
  );
  return !!link;
}

export function unwrapLink(editor) {
  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) &&
      Element.isElement(node) &&
      LINK_TYPES.includes((node as CustomElement).type as INLINES),
  });
}

export function wrapLink(editor, { text, url, target, type, path }: InsertLinkOptions) {
  if (isLinkActive(editor) && !path) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type,
    data: {},
    children: isCollapsed ? [{ text }] : [],
  };

  if (url) {
    link.data = { uri: url };
  }

  if (target) {
    link.data = { target };
  }

  // TODO: always set the selection to the end of the inserted link
  if (path) {
    Transforms.setNodes(editor, link, { at: path });
    Transforms.insertText(editor, text, { at: path });
    Transforms.select(editor, path);
  } else if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.delete(editor);
    Transforms.insertText(editor, text);
    Transforms.collapse(editor, { edge: 'end' });
  }
}

export function getAncestorPathFromSelection(editor: PlateEditor) {
  if (!editor.selection) return undefined;

  return Path.levels(editor.selection.focus.path).find((level) => level.length === 1);
}

export function shouldUnwrapBlockquote(editor: PlateEditor, type: BLOCKS) {
  const isQuoteSelected = isBlockSelected(editor, BLOCKS.QUOTE);
  const isValidType = [
    BLOCKS.HEADING_1,
    BLOCKS.HEADING_2,
    BLOCKS.HEADING_3,
    BLOCKS.HEADING_4,
    BLOCKS.HEADING_5,
    BLOCKS.HEADING_6,

    BLOCKS.OL_LIST,
    BLOCKS.UL_LIST,

    BLOCKS.HR,
  ].includes(type);

  return isQuoteSelected && isValidType;
}

export function unwrapFromRoot(editor: PlateEditor) {
  const ancestorPath = getAncestorPathFromSelection(editor);
  Transforms.unwrapNodes(editor, { at: ancestorPath });
}

export const isAtEndOfTextSelection = (editor: PlateEditor) =>
  editor.selection?.focus.offset === getText(editor, editor.selection?.focus.path).length;

export function currentSelectionStartsTableCell(editor: PlateEditor): boolean {
  const [tableCellNode, path] = getNodeEntryFromSelection(editor, [
    BLOCKS.TABLE_CELL,
    BLOCKS.TABLE_HEADER_CELL,
  ]);
  return !!tableCellNode && (!getText(editor, path) || editor.selection?.focus.offset === 0);
}

/**
 * This traversal strategy is unfortunately necessary because Slate doesn't
 * expose something like Node.next(editor).
 */
export function getNextNode(editor: PlateEditor): CustomElement | null {
  if (!editor.selection) {
    return null;
  }
  const descendants = Node.descendants(editor, { from: editor.selection.focus.path });
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = descendants.next();
    if (done) {
      return null;
    }
    const [node, path] = value as NodeEntry;
    if (Path.isCommon(path, editor.selection.focus.path)) {
      continue;
    }
    return node as CustomElement;
  }
}

export function currentSelectionPrecedesTableCell(editor: PlateEditor): boolean {
  const nextNode = getNextNode(editor);
  return (
    !!nextNode && TABLE_BLOCKS.includes(nextNode.type as BLOCKS) && isAtEndOfTextSelection(editor)
  );
}
