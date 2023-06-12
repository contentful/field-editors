import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import {
  getAboveNode,
  isAncestorEmpty,
  getNodeEntries,
  getPointBefore,
  isInline,
  isEndPoint,
  getPointAfter,
  isRangeCollapsed,
  queryNode,
  isText,
} from '../../internal/queries';
import {
  setSelection,
  select,
  removeNodes,
  splitNodes,
  unhangRange,
  unsetNodes,
} from '../../internal/transforms';
import {
  PlatePlugin,
  PlateEditor,
  Ancestor,
  Node,
  Location,
  BaseRange,
} from '../../internal/types';

export function createTextPlugin(restrictedMarks: string[] = []): PlatePlugin {
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

        setSelection(editor, unhangRange(editor, editor.selection) as Partial<BaseRange>);
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
        if (selection && isRangeCollapsed(selection)) {
          const inlinePath = getAboveNode(editor, {
            match: (n) => isInline(editor, n),
            mode: 'highest',
          })?.[1];

          if (inlinePath && isEndPoint(editor, selection.anchor, inlinePath)) {
            const point = getPointAfter(editor, inlinePath);
            setSelection(editor, {
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
        match: isText,
        transform: (editor, [, path]) => {
          unsetNodes(editor, restrictedMarks, { at: path });
        },
        validNode: (_editor, [node]) => {
          return !restrictedMarks.some((mark) => {
            return mark in node;
          });
        },
      },
    ],
  };
}

function deleteEmptyParagraph(
  unit: 'character' | 'word' | 'line' | 'block',
  editor: PlateEditor,
  deleteFunction: Function
) {
  const entry = getAboveNode(editor, {
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
      removeNodes(editor, { at: path });

      const prevNode = getPointBefore(editor, editor.selection as Location, {
        unit,
      });

      if (prevNode) {
        const [prevCell] = getNodeEntries(editor, {
          match: (node: Node) =>
            queryNode([node, prevNode.path], {
              allow: [
                BLOCKS.EMBEDDED_ASSET,
                BLOCKS.EMBEDDED_ENTRY,
                BLOCKS.EMBEDDED_RESOURCE,
                BLOCKS.HR,
              ],
            }),
          at: prevNode,
        });

        if (prevCell) {
          select(editor, prevNode);
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
function fixPasteAsPlainText(editor: PlateEditor) {
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
        splitNodes(editor, { always: true });
      }

      editor.insertText(line);
      split = true;
    }

    return true;
  };
}
