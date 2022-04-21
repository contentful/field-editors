import { BLOCKS, INLINES, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { getAbove, isAncestorEmpty, queryNode, TNode } from '@udecode/plate-core';
import { Editor, Ancestor, Transforms, Range, Location } from 'slate';

import { RichTextEditor, RichTextPlugin } from '../../types';

export function createTextPlugin(): RichTextPlugin {
  return {
    key: 'TextPlugin',
    handlers: {
      // Triple selection in a non-Firefox browser undesirably selects
      // the start of the next block. Editor.unhangRange helps removing
      // the extra block at the end.
      onMouseUp: (editor) => () => {
        if (!editor.selection) {
          return;
        }

        Transforms.setSelection(editor, Editor.unhangRange(editor, editor.selection));
      },
    },
    withOverrides: (editor) => {
      // Reverts the change made upstream that caused the cursor
      // to be trapped inside inline elements.
      //
      // Reverts https://github.com/ianstormtaylor/slate/pull/4578/
      // Related https://github.com/ianstormtaylor/slate/issues/4704
      const { insertText } = editor;

      editor.insertText = (text) => {
        const { selection } = editor;

        // If the cursor is at the end of an inline, move it outside
        // before inserting
        if (selection && Range.isCollapsed(selection)) {
          const inlinePath = Editor.above(editor, {
            match: (n) => Editor.isInline(editor, n),
            mode: 'highest',
          })?.[1];

          if (inlinePath && Editor.isEnd(editor, selection.anchor, inlinePath)) {
            const point = Editor.after(editor, inlinePath);
            Transforms.setSelection(editor, {
              anchor: point,
              focus: point,
            });
          }
        }

        return insertText(text);
      };

      // When pressing delete instead of backspace
      const { deleteForward, deleteBackward } = editor;

      editor.deleteBackward = (unit) => {
        deleteEmptyParagraph(unit, editor, deleteBackward);
      };

      editor.deleteForward = (unit) => {
        deleteEmptyParagraph(unit, editor, deleteForward);
      };

      return editor;
    },
  };
}

function deleteEmptyParagraph(
  unit: 'character' | 'word' | 'line' | 'block',
  editor: RichTextEditor,
  deleteFunction: Function
) {
  const entry = getAbove(editor, {
    match: {
      type: TEXT_CONTAINERS,
    },
  });

  if (entry) {
    const [paragraphOrHeading, path] = entry;
    const isTextEmpty = isAncestorEmpty(editor, paragraphOrHeading as Ancestor);
    // We ignore paragraphs/headings that are children of ul, ol, blockquote, tables, etc
    const isRootLevel = path.length === 1;
    const hasSiblings = editor.children.length > 1; // prevent editor from losing focus

    if (isTextEmpty && isRootLevel && hasSiblings) {
      Transforms.removeNodes(editor, { at: path });

      const prevNode = Editor.before(editor, editor.selection as Location, {
        unit,
      });

      if (prevNode) {
        const [prevCell] = Editor.nodes<TNode>(editor, {
          match: (node) =>
            queryNode([node as TNode, prevNode.path], {
              allow: [
                BLOCKS.EMBEDDED_ASSET,
                BLOCKS.EMBEDDED_ENTRY,
                BLOCKS.HR,
                INLINES.EMBEDDED_ENTRY,
              ],
            }),
          at: prevNode,
        });

        if (prevCell) {
          Transforms.select(editor, prevNode);
        }
      }
    } else {
      deleteFunction(unit);
    }
  } else {
    deleteFunction(unit);
  }
}
