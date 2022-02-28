import { Link } from '@contentful/field-editor-reference/dist/types';
import { BLOCKS, HEADINGS, INLINES, TABLE_BLOCKS } from '@contentful/rich-text-types';
import { getText } from '@udecode/plate-core';
import { Text, Editor, Element, Transforms, Path, Range, Node } from 'slate';
import { ReactEditor } from 'slate-react';

import { CustomElement, RichTextEditor } from '../types';
import { IS_SAFARI } from './environment';

export const LINK_TYPES: INLINES[] = [
  INLINES.HYPERLINK,
  INLINES.ENTRY_HYPERLINK,
  INLINES.ASSET_HYPERLINK,
];

const LIST_TYPES: BLOCKS[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];

export function isBlockSelected(editor: RichTextEditor, type: string): boolean {
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

type NodeEntry = [CustomElement, Path];
type NodeType = BLOCKS | INLINES;
export function getNodeEntryFromSelection(
  editor: RichTextEditor,
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

export function isNodeTypeSelected(editor: RichTextEditor, nodeType: BLOCKS | INLINES): boolean {
  if (!editor) return false;
  const [node] = getNodeEntryFromSelection(editor, nodeType);
  return !!node;
}

export function moveToTheNextLine(editor: RichTextEditor) {
  Transforms.move(editor, { distance: 1, unit: 'line' });
}

export function getElementFromCurrentSelection(editor: RichTextEditor) {
  if (!editor.selection) return [];

  return Array.from(
    Editor.nodes(editor, {
      /**
       * editor.select is a Range, which includes anchor and focus, the beginning and the end of a selection
       * when using only editor.selection.focus, we might get only the end of the selection, or where the text cursor is
       * and in some cases getting the next element instead of the one we want
       **/
      at: editor.selection,
      match: (node) => Element.isElement(node),
    })
  ).flat();
}

export function isList(editor?: RichTextEditor) {
  if (!editor) {
    return false;
  }

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
export function isLinkActive(editor?: RichTextEditor) {
  if (!editor) {
    return false;
  }

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

export function getAncestorPathFromSelection(editor: RichTextEditor) {
  if (!editor.selection) return undefined;

  return Path.levels(editor.selection.focus.path).find((level) => level.length === 1);
}

export function shouldUnwrapBlockquote(editor: RichTextEditor, type: BLOCKS) {
  const isQuoteSelected = isBlockSelected(editor, BLOCKS.QUOTE);
  const isValidType = [...HEADINGS, BLOCKS.OL_LIST, BLOCKS.UL_LIST, BLOCKS.HR].includes(type);

  return isQuoteSelected && isValidType;
}

export function unwrapFromRoot(editor: RichTextEditor) {
  const ancestorPath = getAncestorPathFromSelection(editor);
  Transforms.unwrapNodes(editor, { at: ancestorPath });
}

export const isAtEndOfTextSelection = (editor: RichTextEditor) =>
  editor.selection?.focus.offset === getText(editor, editor.selection?.focus.path).length;

export function currentSelectionStartsTableCell(editor: RichTextEditor): boolean {
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
export function getNextNode(editor: RichTextEditor): CustomElement | null {
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
export function currentSelectionPrecedesTableCell(editor: RichTextEditor): boolean {
  const nextNode = getNextNode(editor);
  return (
    !!nextNode && TABLE_BLOCKS.includes(nextNode.type as BLOCKS) && isAtEndOfTextSelection(editor)
  );
}

export const INLINE_TYPES = Object.values(INLINES) as string[];

export const isInlineOrText = (node: Node) => {
  // either text or inline elements
  return Text.isText(node) || (Element.isElement(node) && INLINE_TYPES.includes(node.type));
};

export const focus = (editor: RichTextEditor) => {
  const x = window.scrollX;
  const y = window.scrollY;

  ReactEditor.focus(editor);

  // Safari has issues with `editor.focus({ preventScroll: true })`, it ignores the option `preventScroll`
  if (IS_SAFARI) {
    setTimeout(function () {
      window.scrollTo(x, y); // restore position
    }, 0);
  }
};
