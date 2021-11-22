import { Path } from 'slate';
import {
  getAbove,
  insertNodes,
  someNode,
  getPlatePluginType,
  PlateEditor,
  TElement,
  getEmptyCellNode,
  TablePluginOptions,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
} from '@udecode/plate';

const addColumn = (
  editor: PlateEditor,
  { header }: TablePluginOptions,
  getNextCellPath: (currentCellPath: Path) => Path
) => {
  if (
    someNode(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentCellItem = getAbove(editor, {
      match: {
        type: [getPlatePluginType(editor, ELEMENT_TD), getPlatePluginType(editor, ELEMENT_TH)],
      },
    });

    const currentTableItem = getAbove(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = getNextCellPath(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;

      currentTableItem[0].children.forEach((_, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        insertNodes<TElement>(
          editor,
          // @ts-expect-error
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

export const addColumnRight = (editor: PlateEditor, options: TablePluginOptions) => {
  addColumn(editor, options, (currentCellPath) => Path.next(currentCellPath));
};

export const addColumnLeft = (editor: PlateEditor, options: TablePluginOptions) => {
  addColumn(editor, options, (currentCellPath) => currentCellPath);
};
