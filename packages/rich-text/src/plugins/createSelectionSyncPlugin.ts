import {
  getEditorWindow,
  getNode,
  getVoidNode,
  hasEditorEditableTarget,
  hasEditorTarget,
  isCollapsed,
  isComposing,
  isEditorFocused,
  isEditorReadOnly,
  toDOMRange,
  toSlateNode,
  toSlateRange
} from '@udecode/plate-common';
import { Range } from 'slate';

import { select } from '../internal/transforms';
import { PlateEditor, PlatePlugin } from '../internal/types';

const syncSelection = (editor: PlateEditor) => {
  const selection = getEditorWindow(editor)?.getSelection();
  if (
    isEditorReadOnly(editor) ||
    isComposing(editor) ||
    !selection ||
    selection.rangeCount === 0 ||
    !hasEditorTarget(editor, selection.anchorNode) ||
    !hasEditorTarget(editor, selection.focusNode)
  ) {
    return;
  }

  // Avoid DOM range mapping when the same full text node and offset already match.
  // Partial leaves and placeholder text still need the range mapping below.
  if (
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
    ) {
      return editor.selection;
    }
  }

  // Copy the visible range before a render or edit uses Slate's delayed selection.
  // Expanded ranges must also match so typing replaces a double-clicked word.
  const range = toSlateRange(editor, selection, { exactMatch: false, suppressThrow: true });
  // Embedded cards contain hidden placeholders. Preserve their model selection.
  if (
    !range ||
    getVoidNode(editor, { at: range.anchor }) ||
    getVoidNode(editor, { at: range.focus })
  ) {
    return;
  }
  if (!editor.selection || !Range.equals(range, editor.selection)) {
    select(editor, range);
  }
  return range;
};

export const createSelectionSyncPlugin = (): PlatePlugin => ({
  key: 'selectionSync',
  handlers: {
    onMouseUp: (editor) => (event) => {
      if (event.button === 0 && hasEditorEditableTarget(editor, event.target)) {
        syncSelection(editor);
      }
    },
    onKeyDown: (editor) => (event) => {
      if (isEditorReadOnly(editor) || event.nativeEvent.isComposing || isComposing(editor)) {
        return;
      }

      // A selected card can retain an old native paragraph caret while unfocused.
      if (
        !isEditorFocused(editor) &&
        editor.selection &&
        getVoidNode(editor, { at: editor.selection.focus })
      ) {
        return;
      }

      // These keys can edit or navigate before Slate receives selectionchange.
      // Run before the heading, list, and break handlers process Enter.
      if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Enter'].includes(event.key)) {
        syncSelection(editor);
        return;
      }

      if (
        !hasEditorEditableTarget(editor, event.target) ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')
      ) {
        return;
      }

      const nativeSelection = getEditorWindow(editor)?.getSelection();
      // Selection.modify is not available in every browser.
      if (!nativeSelection?.isCollapsed || typeof nativeSelection.modify !== 'function') {
        return;
      }
      const before = toSlateRange(editor, nativeSelection, {
        exactMatch: true,
        suppressThrow: true
      });
      if (!before || getVoidNode(editor, { at: before.anchor })) {
        return;
      }

      // Move and synchronize within one event, then prevent the second default move.
      nativeSelection.modify('move', event.key === 'ArrowUp' ? 'backward' : 'forward', 'line');
      if (!syncSelection(editor)) {
        const previous = toDOMRange(editor, before);
        if (previous) {
          nativeSelection.setBaseAndExtent(
            previous.startContainer,
            previous.startOffset,
            previous.endContainer,
            previous.endOffset
          );
        }
        return;
      }
      event.preventDefault();
      return true;
    },
    onCompositionStart: (editor) => () => {
      syncSelection(editor);
    },
    onDOMBeforeInput: (editor) => (event) => {
      const input = ('nativeEvent' in event ? event.nativeEvent : event) as InputEvent;
      if (
        input.isComposing ||
        (!['insertText', 'insertParagraph', 'insertLineBreak'].includes(input.inputType) &&
          !input.inputType.startsWith('delete'))
      ) {
        return;
      }
      syncSelection(editor);
    }
  }
});
