import { Editor, Element, Text, Transforms } from 'slate';
import { CustomEditor, CustomElement } from '../../types';
import { BLOCKS } from '@contentful/rich-text-types';

export function withEditorPlugin(editor: CustomEditor): CustomEditor {
  const { isVoid: originalIsVoid } = editor;
  const LIST_TYPES: string[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];

  function isBlockSelected(type: string): boolean {
    const [match] = Array.from(
      Editor.nodes(editor, {
        match: (node) => Element.isElement(node) && (node as CustomElement).type === type,
      })
    );
    return !!match;
  }

  function isVoid(element): boolean {
    return element.isVoid || originalIsVoid(element);
  }

  function hasSelectionText() {
    return editor.selection
      ? Editor.node(editor, editor.selection.focus.path).some(
          (node) => Text.isText(node) && node.text !== ''
        )
      : false;
  }

  function moveToTheNextLine() {
    Transforms.move(editor, { distance: 1 });
  }

  function toggleBlock(type: string): void {
    const isActive = isBlockSelected(type);
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
      const block = { type, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  }

  function getElementFromCurrentSelection() {
    if (!editor.selection) return [];

    return Array.from(
      Editor.nodes(editor, {
        at: editor.selection.focus,
        match: (node) => Element.isElement(node),
      })
    ).flat();
  }

  function isList() {
    const element = getElementFromCurrentSelection();

    return element.some(
      (element) =>
        Element.isElement(element) && LIST_TYPES.includes((element as CustomElement).type)
    );
  }

  editor.isBlockSelected = isBlockSelected;
  editor.isVoid = isVoid;
  editor.hasSelectionText = hasSelectionText;
  editor.moveToTheNextLine = moveToTheNextLine;
  editor.toggleBlock = toggleBlock;
  editor.getElementFromCurrentSelection = getElementFromCurrentSelection;
  editor.isList = isList;

  return editor;
}
