import { Text, Editor, Element, Transforms, Path, Range } from 'slate';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { CustomElement } from '../types';
import { Link } from '@contentful/field-editor-reference/dist/types';

const LIST_TYPES: string[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];
const LINK_TYPES: string[] = [INLINES.HYPERLINK, INLINES.ASSET_HYPERLINK, INLINES.ENTRY_HYPERLINK];

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
export function getNodeEntryFromSelection(editor, nodeType: BLOCKS | INLINES): NodeEntry | [] {
  if (!editor.selection) return [];
  const { path } = editor.selection.focus;
  for (let i = 0; i < path.length; i++) {
    const nodeEntry = Editor.node(editor, path.slice(0, i + 1)) as NodeEntry;
    if (nodeEntry[0].type === nodeType) return nodeEntry;
  }
  return [];
}

export function moveToTheNextLine(editor) {
  Transforms.move(editor, { distance: 1 });
}

export function toggleBlock(editor, type: string): void {
  const isActive = isBlockSelected(editor, type);
  const isList = LIST_TYPES.includes(type);
  const isQuote = type === BLOCKS.QUOTE;

  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) &&
      Element.isElement(node) &&
      (LIST_TYPES.includes((node as CustomElement).type) ||
        BLOCKS.QUOTE.includes((node as CustomElement).type)),
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
    (element) => Element.isElement(element) && LIST_TYPES.includes((element as CustomElement).type)
  );
}

export function isFirstChild(path: Path) {
  return path[path.length - 1] === 0;
}

interface InsertLinkOptions {
  text: string;
  url?: string;
  target?: Link;
  type: INLINES.HYPERLINK | INLINES.ENTRY_HYPERLINK | INLINES.ASSET_HYPERLINK;
}

export function insertLink(editor, options: InsertLinkOptions) {
  if (editor.selection) {
    wrapLink(editor, options);
  }
}

export function isLinkActive(editor) {
  const [link] = Editor.nodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) &&
      Element.isElement(node) &&
      LINK_TYPES.includes((node as CustomElement).type), // TODO: Support Entry and Asset links
  });
  return !!link;
}

export function unwrapLink(editor) {
  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) &&
      Element.isElement(node) &&
      LINK_TYPES.includes((node as CustomElement).type), // TODO: Support Entry and Asset links
  });
}

export function wrapLink(editor, { text, url, target, type }: InsertLinkOptions) {
  if (isLinkActive(editor)) {
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

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.delete(editor);
    Transforms.insertText(editor, text);
    Transforms.collapse(editor, { edge: 'end' });
  }
}
