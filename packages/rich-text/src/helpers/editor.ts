import { PlateEditor } from '@udecode/plate-core';
import { getText } from '@udecode/plate-core';
import { Link } from '@contentful/field-editor-reference/dist/types';
import { Text, Editor, Element, Transforms, Path, Range, Node } from 'slate';
import { BLOCKS, INLINES, TABLE_BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import { CustomElement } from '../types';

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

export function isRootLevel(path: Path): boolean {
  return path.length === 1;
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

// TODO: this is only used in the Quote plugin. Move there and consider
// replacing it with onKeyDownToggleElement helper from Plate

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

interface InsertLinkOptions {
  text: string;
  type: INLINES.HYPERLINK | INLINES.ENTRY_HYPERLINK | INLINES.ASSET_HYPERLINK;
  url?: string;
  target?: Link;
  path?: Path;
}

// TODO: move to hyperlink plugin
export function insertLink(editor, options: InsertLinkOptions) {
  if (editor.selection) {
    wrapLink(editor, options);
  }
}

// TODO: move to hyperlink plugin
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

// TODO: move to hyperlink plugin
export function unwrapLink(editor) {
  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) &&
      Element.isElement(node) &&
      LINK_TYPES.includes((node as CustomElement).type as INLINES),
  });
}

// TODO: move to hyperlink plugin
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

// TODO: move to table plugin
export function currentSelectionPrecedesTableCell(editor: PlateEditor): boolean {
  const nextNode = getNextNode(editor);
  return (
    !!nextNode && TABLE_BLOCKS.includes(nextNode.type as BLOCKS) && isAtEndOfTextSelection(editor)
  );
}

/**
 * It filters out all paragraphs and headings from a path and convert them into paragraphs.
 */
export function extractParagraphsAt(editor: PlateEditor, path: Path): CustomElement[] {
  const paragraphs: CustomElement[] = Array.from(
    Editor.nodes<CustomElement>(editor, {
      at: path,
      match: (node) => TEXT_CONTAINERS.includes((node as CustomElement).type as BLOCKS),
      mode: 'all',
    })
  ).map(([node]) => ({
    ...node,
    type: BLOCKS.PARAGRAPH,
  }));

  return paragraphs;
}
