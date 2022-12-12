import isHotkey from 'is-hotkey';

import { getRange, getAbove, isMarkActive, addMark, removeMark } from '../../internal';
import { KeyboardHandler, NodeEntry } from '../../internal/types';
import { COMMAND_PROMPT } from './constants';

export const createOnKeyDown = (): KeyboardHandler => {
  return (editor) => {
    return (event) => {
      if (isHotkey('/', event)) {
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

      const [, path] = getAbove(editor) as NodeEntry;
      const range = getRange(editor, path);

      if (isHotkey('backspace', event)) {
        // if it is the last character in the command string
        if (range.focus.offset - range.anchor.offset === 1) {
          removeMark(editor, COMMAND_PROMPT, range);
        }
      }

      if (isHotkey('escape', event)) {
        removeMark(editor, COMMAND_PROMPT, range);
        editor.tracking.onCommandPaletteAction('cancelRichTextCommandPalette');
      }
    };
  };
};
