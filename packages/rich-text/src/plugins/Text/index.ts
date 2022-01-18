import { TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { getAbove, isAncestorEmpty } from '@udecode/plate-core';
import { Ancestor, Transforms } from 'slate';

import { RichTextPlugin } from '../../types';

// TODO: move the logic to the appropriate element plugin(s)
export function createTextPlugin(): RichTextPlugin {
  return {
    key: 'TextPlugin',
    withOverrides: (editor) => {
      const { deleteForward } = editor;

      // When pressing delete instead of backspace
      editor.deleteForward = (unit) => {
        const [textContainer, path] =
          getAbove(editor, {
            match: { type: TEXT_CONTAINERS },
          }) ?? [];

        if (!textContainer || !path) {
          return deleteForward(unit);
        }

        const isTextEmpty = isAncestorEmpty(editor, textContainer as Ancestor);
        // We ignore paragraphs/headings that are children of ul, ol, blockquote, tables, etc
        const isRootLevel = path.length === 1;

        if (isTextEmpty && isRootLevel) {
          Transforms.removeNodes(editor, { at: path });
        } else {
          deleteForward(unit);
        }
      };

      return editor;
    },
  };
}
