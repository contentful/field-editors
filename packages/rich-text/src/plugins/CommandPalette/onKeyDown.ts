import { KeyboardHandler, setMarks, removeMark, isMarkActive, getAbove } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Editor } from 'slate';

import { RichTextEditor } from '../../types';
import { COMMAND_PROMPT } from './constants';

export const createOnKeyDown = (): KeyboardHandler<RichTextEditor> => {
  return (editor) => {
    return (event) => {
      if (isHotkey('/', event)) {
        setMarks(editor, { [COMMAND_PROMPT]: true });
      }

      const isActive = isMarkActive(editor, COMMAND_PROMPT);

      if (isActive) {
        if (isHotkey('enter', event)) {
          event.preventDefault();
        } else if (isHotkey('backspace', event)) {
          const [, path] = getAbove(editor)!;
          const range = Editor.range(editor, path);
          // if it is the last character in the command string
          if (range.focus.offset - range.anchor.offset === 1) {
            removeMark(editor, { key: COMMAND_PROMPT, at: range });
          }
        } else if (isHotkey('escape', event)) {
          const [, path] = getAbove(editor)!;
          const range = Editor.range(editor, path);
          removeMark(editor, { key: COMMAND_PROMPT, at: range });
        }
      }
    };
  };
};
