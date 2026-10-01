import {
  getEditorWindow,
  getNode,
  getVoidNode,
  hasEditorTarget,
  isCollapsed,
  isComposing,
  isEditorFocused,
  select,
  toSlateNode,
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

  // When the browser shows the same full text node and offset as Slate,
  // its caret is already correct. Avoid cloning DOM content in that case.
  // Partial leaves and placeholder text use the normal range mapping below.
  if (
    selection.rangeCount === 1 &&
    selection.isCollapsed &&
    editor.selection &&
    isCollapsed(editor.selection) &&
    selection.anchorNode?.nodeType === Node.TEXT_NODE &&
    selection.anchorNode.parentElement?.hasAttribute('data-slate-string') &&
    selection.anchorOffset === editor.selection.anchor.offset
  ) {
    const node = getNode(editor, editor.selection.anchor.path);
    if (
      node &&
      'text' in node &&
      node.text === selection.anchorNode.textContent &&
      node === toSlateNode(editor, selection.anchorNode)
    )
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
      // Enter can be handled by heading/list/soft-break plugins before a
      // beforeinput event, so sync its caret before those handlers run too.
      if (
        ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Enter'].includes(event.key) &&
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
      // Slate restores the previous selection after a native paragraph break
      // too; it must already match the visible caret before the break starts.
      if (
        (!['insertText', 'insertParagraph', 'insertLineBreak'].includes(input.inputType) &&
          !input.inputType.startsWith('delete')) ||
        input.isComposing ||
        isComposing(editor)
      )
        return;

      syncSelection(editor);
    }
  }
});
