import { Editor, Ancestor, Transforms } from 'slate';
import { PlatePlugin, isAncestorEmpty } from '@udecode/plate';
import { BLOCKS } from '@contentful/rich-text-types';
import { CustomElement } from '../../types';

export function createTextPlugin(): PlatePlugin {
  return {
    withOverrides: (editor) => {
      const { deleteForward } = editor;

      const textTypes: string[] = [
        BLOCKS.PARAGRAPH,
        BLOCKS.HEADING_1,
        BLOCKS.HEADING_2,
        BLOCKS.HEADING_3,
        BLOCKS.HEADING_4,
        BLOCKS.HEADING_5,
        BLOCKS.HEADING_6,
      ];

      // When pressing delete instead of backspace
      editor.deleteForward = (unit) => {
        const [nodes] = Editor.nodes(editor, {
          at: editor.selection?.focus.path,
          match: (node) => textTypes.includes((node as CustomElement).type),
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
