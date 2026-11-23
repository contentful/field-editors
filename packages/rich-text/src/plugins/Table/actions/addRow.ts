import { getNodeEntry, getStartPoint } from '../../../internal/queries';
import { getEmptyRowNode } from '../../../internal/table';
import { insertNodes, select, setNodes, withoutNormalizing } from '../../../internal/transforms';
import { Element, PlateEditor } from '../../../internal/types';
import { GridSlot, spanData } from '../grid';
import { CurrentCell, getCurrentCell } from './mergeCells';

/**
 * Inserts a row at grid row `line` (the current cell's top edge for "above",
 * its bottom edge for "below"). Cells crossing the line grow by one row
 * instead of getting new cells.
 */
const addRow = (editor: PlateEditor, getLine: (current: CurrentCell) => number) => {
  const current = getCurrentCell(editor);
  if (!current) return;

  const { tablePath, grid } = current;
  // Clamp in case an unnormalized rowspan runs past the last row
  const line = Math.min(getLine(current), grid.height);

  // A cell crosses the line when it starts above it and covers row `line`
  const crossing: GridSlot[] = [];
  let coveredCols = 0;
  for (const slot of grid.slots[line] ?? []) {
    if (!slot || slot.origin[0] >= line) continue;
    coveredCols++;
    if (!crossing.includes(slot)) crossing.push(slot);
  }

  const newRowPath = [...tablePath, line];

  withoutNormalizing(editor, () => {
    for (const slot of crossing) {
      const cellPath = [...tablePath, slot.rowIndex, slot.cellIndex];
      const [cell] = getNodeEntry(editor, cellPath) as [Element, unknown];
      setNodes(
        editor,
        {
          data: spanData(cell.data as object | undefined, {
            colspan: slot.colspan,
            rowspan: slot.rowspan + 1,
          }),
        },
        { at: cellPath },
      );
    }

    insertNodes(
      editor,
      getEmptyRowNode(editor, { header: false, colCount: grid.width - coveredCols }),
      { at: newRowPath },
    );

    // Select the first cell in the new row
    const start = getStartPoint(editor, newRowPath);
    if (start) select(editor, start);
  });
};

export const addRowBelow = (editor: PlateEditor) => {
  addRow(editor, ({ slot }) => slot.origin[0] + slot.rowspan);
};

export const addRowAbove = (editor: PlateEditor) => {
  addRow(editor, ({ slot }) => slot.origin[0]);
};
