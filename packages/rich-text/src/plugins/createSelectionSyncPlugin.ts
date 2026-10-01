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

  // The browser's caret can move before Slate's delayed selection update runs.
  // Slate may then edit the old paragraph or move the caret back there. Copy
  // the visible selection before Slate handles the next edit or navigation.
  const range = toSlateRange(editor, selection, { exactMatch: false, suppressThrow: true });
  // Embedded cards (Slate "void" nodes) contain hidden text placeholders.
  // These are not editable text, so keep Slate's own card selection instead.
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
      // Save the clicked caret before a parent rerender can restore Slate's
      // old selection. Waiting until typing starts would be too late.
      if (!isComposing(editor)) syncSelection(editor);
    },
    onKeyDown: (editor) => (event) => {
      if (
        ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(event.key) &&
        // Clicking a card selects it in Slate, but the browser may still keep
        // its old paragraph caret. While the editor is unfocused, preserve
        // that card selection so Backspace/Delete removes the card. Once the
        // editor regains focus, sync again so editing after an arrow key uses
        // the paragraph caret rather than the previously selected card.
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
