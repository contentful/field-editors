import { MARKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, isMarkActive, KeyboardHandler, toggleMark } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { RichTextEditor } from '../../types';

export const buildMarkEventHandler =
  (type: MARKS): KeyboardHandler<RichTextEditor, HotkeyPlugin> =>
  (editor, { options: { hotkey } }) =>
  (event) => {
    if (editor.selection && hotkey && isHotkey(hotkey, event)) {
      event.preventDefault();

      const isActive = isMarkActive(editor, type);
      editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', { markType: type });

      toggleMark(editor, { key: type as string });
    }
  };
