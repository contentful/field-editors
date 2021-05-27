import { Editor, Element, Text, Transforms } from 'slate';
import { CustomEditor, CustomElement } from '../../types';
import { BLOCKS } from '@contentful/rich-text-types';

export function withEditorPlugin(editor: CustomEditor): CustomEditor {
  const { isVoid: originalIsVoid } = editor;

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
    const LIST_TYPES: string[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];
    const isActive = isBlockSelected(type);
    const isList = LIST_TYPES.includes(type);

    Transforms.unwrapNodes(editor, {
      match: (node) =>
        LIST_TYPES.includes(!Editor.isEditor(node) && Element.isElement(node) && node.type),
      split: true,
    });
    const newProperties: Partial<CustomElement> = {
      type: isActive ? BLOCKS.PARAGRAPH : isList ? BLOCKS.LIST_ITEM : type,
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
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

  editor.isBlockSelected = isBlockSelected;
  editor.isVoid = isVoid;
  editor.hasSelectionText = hasSelectionText;
  editor.moveToTheNextLine = moveToTheNextLine;
  editor.toggleBlock = toggleBlock;
  editor.getElementFromCurrentSelection = getElementFromCurrentSelection;

  return editor;
}
