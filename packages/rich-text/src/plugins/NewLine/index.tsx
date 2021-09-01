import { KeyboardEvent } from 'react';
import { PlatePlugin, SPEditor } from '@udecode/plate-core';

export function createNewLinePlugin(): PlatePlugin {
  return {
    onKeyDown: function (editor: SPEditor) {
      return (event: KeyboardEvent) => {
        const isEnter = event.key === 'Enter';
        const isShift = event.shiftKey;

        if (isEnter && isShift) {
          event.preventDefault();
          editor.insertText('\n');
          return true; // To prevent the next handler from running
        }

        return false; // something like next()
      };
    },
  };
}
