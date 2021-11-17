import { KeyboardEvent } from 'react';
import { PlatePlugin, PlateEditor } from '@udecode/plate-core';

export function createNewLinePlugin(): PlatePlugin {
  return {
    onKeyDown: function (editor: PlateEditor) {
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
