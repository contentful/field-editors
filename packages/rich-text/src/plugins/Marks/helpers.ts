// @ts-nocheck
import { MARKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, isMarkActive, KeyboardHandler, toggleMark } from '@udecode/plate-core';
import type { PlateEditor } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { RichTextEditor } from '../../types';

export const toggleMarkAndDeactivateConflictingMarks = (
  editor: PlateEditor<RichTextEditor>,
  mark: MARKS
) => {
  const subs = [MARKS.SUPERSCRIPT, MARKS.SUBSCRIPT];
  const clear = subs.includes(mark) ? subs : [];
  toggleMark(editor, { key: mark, clear });
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
