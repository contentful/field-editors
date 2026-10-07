import type { KeyboardEvent } from 'react';

import isHotkey from 'is-hotkey';

import { isCollapsed } from '../internal/plate';
import { getContentfulPlugins } from '../internal/pluginAdapter';
import { HotkeyPlugin, PlateEditor, PlatePlugin } from '../internal/types';

const editingKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Enter'];

const hasMatchingCaret = (editor: PlateEditor, domSelection: Selection) => {
  const caret = editor.selection;
  if (domSelection.rangeCount !== 1 || !domSelection.isCollapsed || !caret || !isCollapsed(caret)) {
    return false;
  }

  const { anchorNode, anchorOffset } = domSelection;
  if (anchorOffset !== caret.anchor.offset) return false;
  if (
    anchorNode?.nodeType !== Node.TEXT_NODE ||
    !anchorNode.parentElement?.hasAttribute('data-slate-string')
  ) {
    return false;
  }

  // Skip range conversion only for the same complete text node. Matching text
  // alone would confuse identical paragraphs; split leaves need full mapping.
  const node = editor.api.node(caret.anchor.path)?.[0];
  return (
    !!node &&
    'text' in node &&
    node.text === anchorNode.textContent &&
    node === editor.api.toSlateNode(anchorNode)
  );
};

const shouldSyncBeforeKeyDown = (editor: PlateEditor, event: KeyboardEvent) => {
  if (editingKeys.includes(event.key)) return true;
  if (!event.metaKey && !event.ctrlKey) return false;

  return getContentfulPlugins(editor).some(({ handlers, options }) => {
    const { hotkey } = (options ?? {}) as HotkeyPlugin;
    return handlers?.onKeyDown && hotkey && isHotkey(hotkey, event);
  });
};

const isUnfocusedCardSelected = (editor: PlateEditor) =>
  !editor.api.isFocused() &&
  !!editor.selection &&
  !!editor.api.void({ at: editor.selection.focus });

// The browser can move its selection before Slate's delayed update runs.
// Copy it before editing or a host rerender can restore Slate's old caret.
const syncSelectionFromDOM = (editor: PlateEditor) => {
  if (editor.api.isComposing()) return;

  const domSelection = editor.api.getWindow()?.getSelection();
  if (!domSelection) return;

  const { anchorNode, focusNode } = domSelection;
  const isInsideEditor =
    editor.api.hasTarget(anchorNode) &&
    (focusNode === anchorNode || editor.api.hasTarget(focusNode));
  if (!isInsideEditor || hasMatchingCaret(editor, domSelection)) return;

  const range = editor.api.toSlateRange(domSelection, { exactMatch: false, suppressThrow: true });
  if (!range) return;

  // Cards have hidden text placeholders. Mapping those would overwrite the
  // card selection and break Backspace/Delete, so let Slate handle them.
  const touchesCard = editor.api.void({ at: range.anchor }) || editor.api.void({ at: range.focus });
  if (touchesCard) return;

  editor.tf.select(range);
};

export const createSelectionSyncPlugin = (): PlatePlugin => ({
  key: 'selectionSync',
  handlers: {
    onMouseUp: (editor) => () => syncSelectionFromDOM(editor),
    onKeyDown: (editor) => (event) => {
      // These handlers edit before beforeinput. Up/Down remain browser-native.
      if (!shouldSyncBeforeKeyDown(editor, event)) return;

      // Clicking a card can leave the browser caret in the previous paragraph.
      if (isUnfocusedCardSelected(editor) || event.nativeEvent.isComposing) return;

      syncSelectionFromDOM(editor);
    },
    onCompositionStart: (editor) => () => syncSelectionFromDOM(editor),
    onDOMBeforeInput: (editor) => (event) => {
      const input = ('nativeEvent' in event ? event.nativeEvent : event) as InputEvent;
      const changesContent =
        ['insertText', 'insertParagraph', 'insertLineBreak'].includes(input.inputType) ||
        input.inputType.startsWith('delete');
      if (changesContent && !input.isComposing) syncSelectionFromDOM(editor);
    }
  }
});
