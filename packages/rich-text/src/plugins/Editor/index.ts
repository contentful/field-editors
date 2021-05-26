import { Editor, Element, Text, Transforms } from 'slate';
import { CustomEditor, CustomElement } from '../../types';

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

  editor.isBlockSelected = isBlockSelected;
  editor.isVoid = isVoid;
  editor.hasSelectionText = hasSelectionText;
  editor.moveToTheNextLine = moveToTheNextLine;

  return editor;
}
