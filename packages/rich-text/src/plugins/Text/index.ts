import { Editor, Ancestor, Transforms } from 'slate';

import { isAncestorEmpty } from '@udecode/plate-core';
import { TEXT_CONTAINERS, BLOCKS } from '@contentful/rich-text-types';
import { RichTextPlugin, CustomElement } from '../../types';

// TODO: move the logic to the appropriate element plugin(s)
export function createTextPlugin(): RichTextPlugin {
  return {
    key: 'TextPlugin',
    withOverrides: (editor) => {
      const { deleteForward } = editor;

      // When pressing delete instead of backspace
      editor.deleteForward = (unit) => {
        const [nodes] = Editor.nodes(editor, {
          at: editor.selection?.focus.path,
          match: (node) => TEXT_CONTAINERS.includes((node as CustomElement).type as BLOCKS),
        });

        if (nodes) {
          const [paragraphOrHeading, path] = nodes;
          const isTextEmpty = isAncestorEmpty(editor, paragraphOrHeading as Ancestor);
          // We ignore paragraphs/headings that are children of ul, ol, blockquote, tables, etc
          const isRootLevel = path.length === 1;

          if (isTextEmpty && isRootLevel) {
            Transforms.removeNodes(editor, { at: path });
          } else {
            deleteForward(unit);
          }
        } else {
          deleteForward(unit);
        }
      };

      return editor;
    },
  };
}
