import { MARKS } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';

import { isMarkActive } from '../../internal/queries';
import { toggleMark } from '../../internal/transforms';
import { PlateEditor, HotkeyPlugin, KeyboardHandler } from '../../internal/types';

export const toggleMarkAndDeactivateConflictingMarks = (editor: PlateEditor, mark: MARKS) => {
  const subs = [MARKS.SUPERSCRIPT, MARKS.SUBSCRIPT];
  const clear = subs.includes(mark) ? subs : [];
  toggleMark(editor, { key: mark, clear });
};

export const buildMarkEventHandler =
  (type: MARKS): KeyboardHandler<HotkeyPlugin> =>
  (editor, { options: { hotkey } }) =>
  (event) => {
    if (editor.selection && hotkey && isHotkey(hotkey, event)) {
      event.preventDefault();

      const isActive = isMarkActive(editor, type);
      editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', { markType: type });
      toggleMarkAndDeactivateConflictingMarks(editor, type);
    }
  };
