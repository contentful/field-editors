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

  editor.isBlockSelected = isBlockSelected;
  editor.isVoid = isVoid;

  return editor;
}
