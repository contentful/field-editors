import { BLOCKS } from '@contentful/rich-text-types';
import { getEmptyCellNode } from '@udecode/plate-table';

import { getAboveNode, getNextPath, someNode } from '../../../internal/queries';
import { insertNodes } from '../../../internal/transforms';
import { PlateEditor, Path, Element, NodeEntry } from '../../../internal/types';

interface AddColumnOptions {
  header?: boolean;
}

const addColumn = (
  editor: PlateEditor,
  { header }: AddColumnOptions,
  getNextCellPath: (currentCellPath: Path) => Path
) => {
  if (
    someNode(editor, {
      match: { type: BLOCKS.TABLE },
    })
  ) {
    const currentCellItem = getAboveNode(editor, {
      match: {
        type: [BLOCKS.TABLE_HEADER_CELL, BLOCKS.TABLE_CELL],
      },
    });

    const currentTableItem = getAboveNode(editor, {
      match: { type: BLOCKS.TABLE },
    }) as NodeEntry<Element> | undefined;

    if (currentCellItem && currentTableItem) {
      const nextCellPath = getNextCellPath(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;

      currentTableItem[0].children.forEach((_, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        insertNodes(
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

export const addColumnRight = (editor: PlateEditor, options: AddColumnOptions) => {
  addColumn(editor, options, (currentCellPath) => getNextPath(currentCellPath));
};

export const addColumnLeft = (editor: PlateEditor, options: AddColumnOptions) => {
  addColumn(editor, options, (currentCellPath) => currentCellPath);
};
