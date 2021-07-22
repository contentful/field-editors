import { getAbove, insertNodes, someNode } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor, TElement } from '@udecode/slate-plugins-core';
import {
  getEmptyCellNode,
  TablePluginOptions,
  ELEMENT_TABLE,
  ELEMENT_TD,
} from '@udecode/slate-plugins-table';

export { addColumn as addColumnRight } from '@udecode/slate-plugins-table';

export const addColumnLeft = (editor: SPEditor, { header }: TablePluginOptions) => {
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
      const nextCellPath = currentCellItem[1];
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((_, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        // @ts-expect-error
        insertNodes<TElement>(editor, getEmptyCellNode(editor, { header }), {
          at: newCellPath,
          select: rowIdx === currentRowIdx,
        });
      });
    }
  }
};
