import {
  getEditorWindow,
  hasEditorTarget,
  isComposing,
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
  if (range) select(editor, range);
};

export const createSelectionSyncPlugin = (): PlatePlugin => ({
  key: 'selectionSync',
  handlers: {
    onKeyDown: (editor) => (event) => {
      if (
        ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(event.key) &&
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
