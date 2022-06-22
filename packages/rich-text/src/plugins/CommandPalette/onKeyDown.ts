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
        }

        // FIXME: worst case, just use the event.keyCode & event.shiftKey
        if (isHotkey('shift+enter', event)) {
          event.preventDefault();
        }

        if (isHotkey('up', event)) {
          event.preventDefault();
        }

        if (isHotkey('down', event)) {
          event.preventDefault();
        }

        if (isHotkey('escape', event)) {
          const [, path] = getAbove(editor)!;
          const range = Editor.range(editor, path);
          removeMark(editor, { key: COMMAND_PROMPT, at: range });
        }
      }
    };
  };
};
