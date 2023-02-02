import isHotkey from 'is-hotkey';

import { getRange, getAboveNode, isMarkActive, addMark, removeMark } from '../../internal';
import { focusEditor } from '../../internal/misc';
import { KeyboardHandler, NodeEntry } from '../../internal/types';
import { COMMAND_PROMPT } from './constants';

export const createOnKeyDown = (): KeyboardHandler => {
  return (editor) => {
    return (event) => {
      // Support for different keyboard layouts:
      // `isHotKey` uses by default `event.which`, which will never generates a match for all layouts (QWERTY: `/`, QWERTZ: `shift+7`)
      // with `byKey: true` `isHotKey` uses `event.key` which will return the interpreted key '/'
      // It would still fail without the the optional `shift?` param, as it first checks the modKeys (`shiftKey` would be true on QWERTZ)
      if (isHotkey('shift?+/', { byKey: true }, event)) {
        addMark(editor, COMMAND_PROMPT);
        editor.tracking.onCommandPaletteAction('openRichTextCommandPalette');
      }

      const isActive = isMarkActive(editor, COMMAND_PROMPT);

      if (!isActive) {
        return;
      }

      if (isHotkey('enter', event)) {
        return event.preventDefault();
      }

      const [, path] = getAboveNode(editor) as NodeEntry;
      const range = getRange(editor, path);

      if (isHotkey('backspace', event)) {
        // if it is the last character in the command string
        if (range.focus.offset - range.anchor.offset === 1) {
          removeMark(editor, COMMAND_PROMPT, range);
        }
      }

      if (isHotkey('escape', event)) {
        event.stopPropagation();
        removeMark(editor, COMMAND_PROMPT, range);
        editor.tracking.onCommandPaletteAction('cancelRichTextCommandPalette');
        focusEditor(editor);
      }
    };
  };
};
