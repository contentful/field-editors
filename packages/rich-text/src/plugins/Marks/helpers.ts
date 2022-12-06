import { MARKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, isMarkActive, KeyboardHandler, toggleMark } from '@udecode/plate-core';
import type { PlateEditor } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { RichTextEditor } from '../../types';

export const toggleMarkAndDeactivateConflictingMarks = (
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  editor: PlateEditor<RichTextEditor>,
  mark: MARKS
) => {
  const subs = [MARKS.SUPERSCRIPT, MARKS.SUBSCRIPT];
  const clear = subs.includes(mark) ? subs : [];
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  toggleMark(editor, { key: mark, clear });
};

export const buildMarkEventHandler =
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore


    (type: MARKS): KeyboardHandler<RichTextEditor, HotkeyPlugin> =>
    (editor, { options: { hotkey } }) =>
    (event) => {
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      if (editor.selection && hotkey && isHotkey(hotkey, event)) {
        event.preventDefault();
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
        const isActive = isMarkActive(editor, type);
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
        editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', { markType: type });
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
        toggleMarkAndDeactivateConflictingMarks(editor, type);
      }
    };
