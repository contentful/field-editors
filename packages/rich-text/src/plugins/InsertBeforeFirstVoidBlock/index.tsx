import { KeyboardEvent } from 'react';
import { PlatePlugin, SPEditor } from '@udecode/plate-core';
import {
  isFirstChild,
  isVoid,
  getElementFromCurrentSelection,
  moveToThePreviousLine,
} from '../../helpers/editor';
import { Transforms, Path } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';

export function createInsertBeforeFirstVoidBlockPlugin(): PlatePlugin {
  return {
    onKeyDown: function (editor: SPEditor) {
      return (event: KeyboardEvent) => {
        const isEnter = event.key === 'Enter';
        const [currentElement, currentPath] = getElementFromCurrentSelection(editor);
        const isFirst = isFirstChild(currentPath as Path);

        if (isEnter && isFirst && isVoid(editor, currentElement)) {
          const paragraph = {
            type: BLOCKS.PARAGRAPH,
            data: {},
            children: [{ text: '' }],
          };

          // It adds two paragraphs outside a timeout and after moving the cursor to the previous line, not sure why...
          setTimeout(() => {
            Transforms.insertNodes(editor, paragraph, { at: currentPath as Path });
            moveToThePreviousLine(editor);
          }, 0);

          return true; // To prevent the next handler from running
        }

        return false; // something like next()
      };
    },
  };
}
