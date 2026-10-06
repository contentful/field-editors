import type { KeyboardEvent } from 'react';

import isHotkey from 'is-hotkey';

import { isCollapsed } from '../internal/plate';
import { getContentfulPlugins } from '../internal/pluginAdapter';
import { HotkeyPlugin, PlateEditor, PlatePlugin } from '../internal/types';

const caretKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Enter'];

// Skip DOM mapping only when both carets refer to the same full text node
// and offset. Partial leaves and placeholders still need the full mapping.
const hasMatchingCaret = (editor: PlateEditor, selection: Selection, anchorNode: Node | null) => {
  const caret = editor.selection;
  if (
    selection.rangeCount !== 1 ||
    !selection.isCollapsed ||
    !caret ||
    !isCollapsed(caret) ||
    anchorNode?.nodeType !== Node.TEXT_NODE ||
    !anchorNode.parentElement?.hasAttribute('data-slate-string') ||
    selection.anchorOffset !== caret.anchor.offset
  )
    return false;

  const node = editor.api.node(caret.anchor.path)?.[0];
  return (
    node &&
    'text' in node &&
    node.text === anchorNode.textContent &&
    node === editor.api.toSlateNode(anchorNode)
  );
};

const isEditorShortcut = (editor: PlateEditor, event: KeyboardEvent) => {
  if (!event.metaKey && !event.ctrlKey) return false;

  return getContentfulPlugins(editor).some(({ handlers, options }) => {
    const { hotkey } = (options ?? {}) as HotkeyPlugin;
    return handlers?.onKeyDown && hotkey && isHotkey(hotkey, event);
  });
};

const syncSelection = (editor: PlateEditor) => {
  const selection = editor.api.getWindow()?.getSelection();
  if (!selection) return;

  // Read each DOM endpoint once. A caret shares both endpoints, so it also
  // needs only one check that it belongs to this editor.
  const { anchorNode, focusNode } = selection;
  if (
    !editor.api.hasTarget(anchorNode) ||
    (focusNode !== anchorNode && !editor.api.hasTarget(focusNode))
  ) {
    return;
  }

  if (hasMatchingCaret(editor, selection, anchorNode)) return;

  // The browser's caret can move before Slate's delayed selection update runs.
  // Slate may then edit the old paragraph or move the caret back there. Copy
  // the visible selection before Slate handles the next edit or navigation.
  const range = editor.api.toSlateRange(selection, { exactMatch: false, suppressThrow: true });
  // Embedded cards (Slate "void" nodes) contain hidden text placeholders.
  // These are not editable text, so keep Slate's own card selection instead.
  if (
    !range ||
    editor.api.void({ at: range.anchor }) ||
    editor.api.void({ at: range.focus })
  )
    return;

  editor.tf.select(range);
};

export const createSelectionSyncPlugin = (): PlatePlugin => ({
  key: 'selectionSync',
  handlers: {
    onMouseUp: (editor) => () => {
      // Save the clicked caret before a parent rerender can restore Slate's
      // old selection. Waiting until typing starts would be too late.
      if (!editor.api.isComposing()) syncSelection(editor);
    },
    onKeyDown: (editor) => (event) => {
      // Formatting shortcuts and Enter run before beforeinput. Give those
      // handlers the visible caret too, without syncing every Up/Down key.
      if (!caretKeys.includes(event.key) && !isEditorShortcut(editor, event)) return;

      // A selected card can leave the browser caret in an old paragraph.
      // Keep Slate's card selection until the editor regains focus, so
      // Backspace/Delete acts on the card instead of that paragraph.
      if (
        !editor.api.isFocused() &&
        editor.selection &&
        editor.api.void({ at: editor.selection.focus })
      )
        return;

      if (event.nativeEvent.isComposing || editor.api.isComposing()) return;
      syncSelection(editor);
    },
    onCompositionStart: (editor) => () => {
      if (!editor.api.isComposing()) syncSelection(editor);
    },
    onDOMBeforeInput: (editor) => (event) => {
      const input = ('nativeEvent' in event ? event.nativeEvent : event) as InputEvent;
      // Slate restores the previous selection after a native paragraph break
      // too; it must already match the visible caret before the break starts.
      const changesContent =
        ['insertText', 'insertParagraph', 'insertLineBreak'].includes(input.inputType) ||
        input.inputType.startsWith('delete');
      if (changesContent && !input.isComposing && !editor.api.isComposing()) syncSelection(editor);
    }
  }
});
