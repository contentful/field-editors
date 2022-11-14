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
  if (mark === MARKS.SUBSCRIPT && isMarkActive(editor, MARKS.SUPERSCRIPT)) {
    toggleMark(editor, { key: MARKS.SUPERSCRIPT });
  } else if (mark === MARKS.SUPERSCRIPT && isMarkActive(editor, MARKS.SUBSCRIPT)) {
    toggleMark(editor, { key: MARKS.SUBSCRIPT });
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
