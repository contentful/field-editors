import { Text, Editor, Element, Transforms, Path } from 'slate';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { CustomElement } from '../types';
import { SPEditor } from '@udecode/slate-plugins-core';

const LIST_TYPES: string[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];

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
export function getNodeEntryFromSelection(
  editor: Editor | SPEditor,
  nodeType: BLOCKS | INLINES
): NodeEntry | [] {
  if (!editor.selection) return [];
  const { path } = editor.selection.focus;
  for (let i = 0; i < path.length; i++) {
    const nodeEntry = Editor.node(editor, path.slice(0, i + 1)) as NodeEntry;
    if (nodeEntry[0].type === nodeType) return nodeEntry;
  }
  return []
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
      children: []
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
