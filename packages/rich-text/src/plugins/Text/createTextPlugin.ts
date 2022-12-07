import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { getAbove, isAncestorEmpty, queryNode, TNode, unsetNodes } from '@udecode/plate-core';
import { Editor, Ancestor, Transforms, Range, Location, Text } from 'slate';

import { RichTextEditor, RichTextPlugin } from '../../types';

export function createTextPlugin(unavailableMarks: string[] = []): RichTextPlugin {
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

      fixPasteAsPlainText(editor);

      return editor;
    },
    normalizer: [
      {
        match: () => Text.isText,
        transform: (editor, [, path]) => {
          unsetNodes(editor, unavailableMarks, { at: path });
        },
        validNode: (_editor, [node]) => {
          return !unavailableMarks.some((mark) => {
            return mark in node;
          });
        },
      },
    ],
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
              allow: [BLOCKS.EMBEDDED_ASSET, BLOCKS.EMBEDDED_ENTRY, BLOCKS.HR],
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

/**
 * To be compatible with the old behavior we need to treat each 2 consecutive
 * line breaks as a new paragraph when pasting as plain text (also known as
 * paste and match style in macOS)
 */
function fixPasteAsPlainText(editor: RichTextEditor) {
  editor.insertTextData = (data: DataTransfer): boolean => {
    const text = data.getData('text/plain');

    if (!text) {
      return false;
    }

    const lines = text.split(/\n{2}/);
    let split = false;

    for (const line of lines) {
      // empty lines
      if (/^(\r\n?|\n)$/.test(line)) {
        continue;
      }

      if (split) {
        Transforms.splitNodes(editor, { always: true });
      }

      editor.insertText(line);
      split = true;
    }

    return true;
  };
}
