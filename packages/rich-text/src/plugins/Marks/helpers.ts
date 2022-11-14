import { HotkeyPlugin, isMarkActive, KeyboardHandler, toggleMark } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import type { PlateEditor } from '@udecode/plate-core';
import type { MARKS } from '@contentful/rich-text-types';

import { RichTextEditor } from '../../types';

export const toggleMarkAndDeactivateConflictingMarks = (
  editor: PlateEditor<RichTextEditor>,
  mark: MARKS
) => {
  toggleMark(editor, { key: mark });
  if (mark === 'subscript' && isMarkActive(editor, 'superscript')) {
    toggleMark(editor, { key: 'superscript' });
  } else if (mark === 'superscript' && isMarkActive(editor, 'subscript')) {
    toggleMark(editor, { key: 'subscript' });
  }
};

export const buildMarkEventHandler =
  (type: MARKS): KeyboardHandler<RichTextEditor, HotkeyPlugin> =>
  (editor, { options: { hotkey } }) =>
  (event) => {
    if (editor.selection && hotkey && isHotkey(hotkey, event)) {
      event.preventDefault();

      const isActive = isMarkActive(editor, type);
      editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', { markType: type });
      toggleMarkAndDeactivateConflictingMarks(editor, type);
    }
  };
