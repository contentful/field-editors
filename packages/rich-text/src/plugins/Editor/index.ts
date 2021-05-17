import { Editor, Element } from 'slate';
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

  function isVoid(element: CustomElement): boolean {
    return element.isVoid || originalIsVoid(element);
  }

  function hasSelectionText() {
    return editor.selection
      ? Editor.node(editor, editor.selection.focus.path).some(
          (node) => node.text && node.text !== ''
        )
      : false;
  }

  editor.isBlockSelected = isBlockSelected;
  editor.isVoid = isVoid;
  editor.hasSelectionText = hasSelectionText;

  return editor;
}
