import { Editor, Ancestor, Transforms } from 'slate';
import { PlatePlugin, isAncestorEmpty } from '@udecode/plate';
import { TEXT_CONTAINERS, BLOCKS } from '@contentful/rich-text-types';
import { CustomElement } from '../../types';

export function createTextPlugin(): PlatePlugin {
  return {
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
