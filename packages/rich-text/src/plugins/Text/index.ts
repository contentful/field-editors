import { Editor, Ancestor, Transforms, Text } from 'slate';
import { PlatePlugin } from '@udecode/plate-core';
import { isAncestorEmpty, getParent } from '@udecode/plate-core';
import { TEXT_CONTAINERS, INLINES, BLOCKS } from '@contentful/rich-text-types';
import { CustomElement } from '../../types';

// TODO: move the logic to the appropriate element plugin(s)
export function createTextPlugin(): PlatePlugin {
  return {
    key: 'TextPlugin',
    withOverrides: (editor) => {
      const { deleteForward, normalizeNode } = editor;

      editor.normalizeNode = (entry) => {
        const [node, path] = entry;

        if (!Text.isText(node)) {
          return normalizeNode(entry);
        }

        const parent = getParent(editor, path)?.[0];

        const isTextAllowed =
          parent &&
          (TEXT_CONTAINERS.includes(parent.type) || Object.values(INLINES).includes(parent.type));

        // Force text elements to be wrapped in a text container
        // This will be enforced by sanitizeSlateDoc() but the internal
        // editor value can be different. It can lead, for example, to bugs like:
        // Pressing ENTER on a table cell creates another column 🤷‍♂️
        //
        // cf. https://github.com/ianstormtaylor/slate/issues/2206
        if (!isTextAllowed) {
          const paragraph = { type: BLOCKS.PARAGRAPH, data: {}, children: [] };
          Transforms.wrapNodes(editor, paragraph, { at: path });
          return;
        }

        normalizeNode(entry);
      };

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
