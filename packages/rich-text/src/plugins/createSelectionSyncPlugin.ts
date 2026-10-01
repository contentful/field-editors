import {
  getEditorWindow,
  hasEditorTarget,
  isComposing,
  select,
  toSlateRange
} from '@udecode/plate-common';

import { PlatePlugin } from '../internal/types';

export const createSelectionSyncPlugin = (): PlatePlugin => ({
  key: 'selectionSync',
  handlers: {
    onDOMBeforeInput: (editor) => (event) => {
      const input = ('nativeEvent' in event ? event.nativeEvent : event) as InputEvent;
      if (input.inputType !== 'insertText' || input.isComposing || isComposing(editor)) return;

      const selection = getEditorWindow(editor)?.getSelection();
      if (
        !selection ||
        !hasEditorTarget(editor, selection.anchorNode) ||
        !hasEditorTarget(editor, selection.focusNode)
      ) {
        return;
      }

      // Slate can ignore selectionchange while an earlier DOM caret update is
      // pending, then restore that stale selection after inserting native text.
      const range = toSlateRange(editor, selection, { exactMatch: false, suppressThrow: true });
      if (range) select(editor, range);
    }
  }
});
