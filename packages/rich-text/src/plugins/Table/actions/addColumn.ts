import { getPluginType, TElement, getAboveNode, insertNodes, someNode } from '@udecode/plate-core';
import { getEmptyCellNode, ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH } from '@udecode/plate-table';
import { Path } from 'slate';

import { RichTextEditor } from '../../../types';

const addColumn = (
  editor: RichTextEditor,
  // TODO check this

  { header }: any,
  getNextCellPath: (currentCellPath: Path) => Path
) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentCellItem = getAboveNode(editor, {
      match: {
        type: [getPluginType(editor, ELEMENT_TD), getPluginType(editor, ELEMENT_TH)],
      },
    });

    const currentTableItem = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = getNextCellPath(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;

      currentTableItem[0].children.forEach((_, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        insertNodes<TElement>(
          editor,
          getEmptyCellNode(editor, { header: header && rowIdx === 0 }),
          {
            at: newCellPath,
            // Select the first cell of the new column
            select: rowIdx === 0,
          }
        );
      });
    }
  }
};

// TODO check this

export const addColumnRight = (editor: RichTextEditor, options: any) => {
  addColumn(editor, options, (currentCellPath) => Path.next(currentCellPath));
};

// TODO check this

export const addColumnLeft = (editor: RichTextEditor, options: any) => {
  addColumn(editor, options, (currentCellPath) => currentCellPath);
};
