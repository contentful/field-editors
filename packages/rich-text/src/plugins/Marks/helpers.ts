import { MARKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, isMarkActive, KeyboardHandler, toggleMark } from '@udecode/plate-core';
import type { PlateEditor } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { RichTextEditor } from '../../types';

export const toggleMarkAndDeactivateConflictingMarks = (
  // TODO check this

  // @ts-ignore
  editor: PlateEditor<RichTextEditor>,
  mark: MARKS
) => {
  const subs = [MARKS.SUPERSCRIPT, MARKS.SUBSCRIPT];
  const clear = subs.includes(mark) ? subs : [];
  // TODO check this

  // @ts-ignore
  toggleMark(editor, { key: mark, clear });
};

export const buildMarkEventHandler =
  // TODO check this

  // @ts-ignore


    (type: MARKS): KeyboardHandler<RichTextEditor, HotkeyPlugin> =>
    (editor, { options: { hotkey } }) =>
    (event) => {
      // TODO check this

      // @ts-ignore
      if (editor.selection && hotkey && isHotkey(hotkey, event)) {
        event.preventDefault();
        // TODO check this

        // @ts-ignore
        const isActive = isMarkActive(editor, type);
        // TODO check this

        // @ts-ignore
        editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', { markType: type });
        // TODO check this

        // @ts-ignore
        toggleMarkAndDeactivateConflictingMarks(editor, type);
      }
    };
