import { Path } from 'slate';
import { getAbove, insertNodes, someNode } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor, TElement } from '@udecode/slate-plugins-core';
import {
  getEmptyCellNode,
  TablePluginOptions,
  ELEMENT_TABLE,
  ELEMENT_TD,
} from '@udecode/slate-plugins-table';

const addColumn = (
  editor: SPEditor,
  { header }: TablePluginOptions,
  getNextCellPath: (currentCellPath: Path) => Path
) => {
  if (
    someNode(editor, {
      match: { type: getSlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentCellItem = getAbove(editor, {
      match: {
        type: [getSlatePluginType(editor, ELEMENT_TD), getSlatePluginType(editor, ELEMENT_TD)],
      },
    });

    const currentTableItem = getAbove(editor, {
      match: { type: getSlatePluginType(editor, ELEMENT_TABLE) },
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = getNextCellPath(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;

      currentTableItem[0].children.forEach((_, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        // @ts-expect-error
        insertNodes<TElement>(editor, getEmptyCellNode(editor, { header }), {
          at: newCellPath,
          // Select the first cell of the new column
          select: rowIdx === 0,
        });
      });
    }
  }
};

export const addColumnRight = (editor: SPEditor, options: TablePluginOptions) => {
  addColumn(editor, options, (currentCellPath) => Path.next(currentCellPath));
};

export const addColumnLeft = (editor: SPEditor, options: TablePluginOptions) => {
  addColumn(editor, options, (currentCellPath) => currentCellPath);
};
