import {
  getEditorWindow,
  getVoidNode,
  hasEditorTarget,
  isComposing,
  isEditorFocused,
  select,
  toSlateRange
} from '@udecode/plate-common';

import { PlateEditor, PlatePlugin } from '../internal/types';

const syncSelection = (editor: PlateEditor) => {
  const selection = getEditorWindow(editor)?.getSelection();
  if (
    !selection ||
    !hasEditorTarget(editor, selection.anchorNode) ||
    !hasEditorTarget(editor, selection.focusNode)
  ) {
    return;
  }

  // Slate can ignore selectionchange while an earlier DOM caret update is
  // pending, then use that stale selection for the next edit or navigation.
  const range = toSlateRange(editor, selection, { exactMatch: false, suppressThrow: true });
  // Embedded cards have hidden text placeholders; these are not typing carets.
  if (
    range &&
    !getVoidNode(editor, { at: range.anchor }) &&
    !getVoidNode(editor, { at: range.focus })
  )
    select(editor, range);
};

export const createSelectionSyncPlugin = (): PlatePlugin => ({
  key: 'selectionSync',
  handlers: {
    onMouseUp: (editor) => () => {
      if (!isComposing(editor)) syncSelection(editor);
    },
    onKeyDown: (editor) => (event) => {
      if (
        ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(event.key) &&
        // A focused card is selected independently of the browser's text caret.
        !(
          !isEditorFocused(editor) &&
          editor.selection &&
          getVoidNode(editor, { at: editor.selection.focus })
        ) &&
        !event.nativeEvent.isComposing &&
        !isComposing(editor)
      )
        syncSelection(editor);
    },
    onCompositionStart: (editor) => () => {
      if (!isComposing(editor)) syncSelection(editor);
    },
    onDOMBeforeInput: (editor) => (event) => {
      const input = ('nativeEvent' in event ? event.nativeEvent : event) as InputEvent;
      if (
        (input.inputType !== 'insertText' && !input.inputType.startsWith('delete')) ||
        input.isComposing ||
        isComposing(editor)
      )
        return;

      syncSelection(editor);
    }
  }
});
