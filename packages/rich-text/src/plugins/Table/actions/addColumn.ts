import { getNodeEntry, getStartPoint } from '../../../internal/queries';
import { getEmptyCellNode } from '../../../internal/table';
import { insertNodes, select, setNodes, withoutNormalizing } from '../../../internal/transforms';
import { Element, Path, PlateEditor } from '../../../internal/types';
import { getInsertIndex, spanData } from '../grid';
import { CurrentCell, getCurrentCell } from './mergeCells';

interface AddColumnOptions {
  header?: boolean;
}

/**
 * Inserts a column at grid column `line` (the current cell's left edge for
 * "left", its right edge for "right"). Cells crossing the line grow by one
 * column instead of getting new cells.
 */
const addColumn = (
  editor: PlateEditor,
  { header }: AddColumnOptions,
  getLine: (current: CurrentCell) => number,
) => {
  const current = getCurrentCell(editor, { atAnchor: true });
  if (!current) return;

  const { tablePath, grid } = current;
  const line = getLine(current);

  withoutNormalizing(editor, () => {
    let topNewCellPath: Path | undefined;

    // Bottom row first so row paths stay valid; positions come from the pre-insert grid
    for (let r = grid.height - 1; r >= 0; r--) {
      const slot = grid.slots[r]?.[line];

      if (slot && slot.origin[1] < line) {
        // Crossing cell: extend it once, from its origin row
        if (slot.origin[0] === r) {
          const cellPath = [...tablePath, slot.rowIndex, slot.cellIndex];
          const [cell] = getNodeEntry(editor, cellPath) as [Element, unknown];
          setNodes(
            editor,
            {
              data: spanData(cell.data as object | undefined, {
                colspan: slot.colspan + 1,
                rowspan: slot.rowspan,
              }),
            },
            { at: cellPath },
          );
        }
        continue;
      }

      topNewCellPath = [...tablePath, r, getInsertIndex(grid, r, line)];
      insertNodes(editor, getEmptyCellNode(editor, { header: header && r === 0 }), {
        at: topNewCellPath,
      });
    }

    // Select the top cell of the new column
    const start = topNewCellPath && getStartPoint(editor, topNewCellPath);
    if (start) select(editor, start);
  });
};

export const addColumnRight = (editor: PlateEditor, options: AddColumnOptions) => {
  addColumn(editor, options, ({ slot }) => slot.origin[1] + slot.colspan);
};

export const addColumnLeft = (editor: PlateEditor, options: AddColumnOptions) => {
  addColumn(editor, options, ({ slot }) => slot.origin[1]);
};
