import { BLOCKS } from '@contentful/rich-text-types';

import { getAboveNode, isRangeExpanded } from '../../../internal/queries';
import {
  deleteColumn as deleteColumnPlate,
  deleteRow as deleteRowPlate,
} from '../../../internal/table';
import { moveNodes, removeNodes, withoutNormalizing } from '../../../internal/transforms';
import { Element, PlateEditor } from '../../../internal/types';
import { GridSlot, getInsertIndex, getTableGrid, hasSpans } from '../grid';
import {
  getCurrentCell,
  getEmptiedRows,
  getSlotCell,
  getSlotPath,
  setSpan,
  uniqueSlots,
} from './spanUtils';

/**
 * A selection across several cells of a span-free table is handed to Plate,
 * which is what the menu used before. Any other selection acts on the cell
 * at its anchor.
 */
const shouldDelegateToPlate = (editor: PlateEditor): boolean => {
  if (!isRangeExpanded(editor.selection ?? undefined)) return false;
  const tableEntry = getAboveNode(editor, { match: { type: BLOCKS.TABLE } });
  if (!tableEntry) return false;
  return !hasSpans(getTableGrid(tableEntry[0] as Element));
};

/**
 * Deletes the current cell's origin row. Cells crossing it from above shrink;
 * cells starting in it that span further down move to the next row.
 */
export const deleteRow = (editor: PlateEditor): void => {
  if (shouldDelegateToPlate(editor)) return deleteRowPlate(editor);
  const current = getCurrentCell(editor, { atAnchor: true });
  if (!current) return;

  const { table, tablePath, grid, slot } = current;
  const row = slot.origin[0];
  // Like Plate: the last remaining row is not deleted
  if (grid.height <= 1) return;

  const cells = uniqueSlots(grid.slots[row]);

  withoutNormalizing(editor, () => {
    // Cells crossing from above sit in earlier rows, so their paths are unaffected
    for (const cell of cells) {
      if (cell.origin[0] < row) {
        setSpan(editor, getSlotPath(tablePath, cell), getSlotCell(table, cell), {
          colspan: cell.colspan,
          rowspan: cell.rowspan - 1,
        });
      }
    }

    // Rightmost first, so indices in both rows stay valid
    if (row + 1 < grid.height) {
      for (const cell of [...cells].reverse()) {
        if (cell.origin[0] !== row || cell.rowspan <= 1) continue;
        const from = getSlotPath(tablePath, cell);
        setSpan(editor, from, getSlotCell(table, cell), {
          colspan: cell.colspan,
          rowspan: cell.rowspan - 1,
        });
        moveNodes(editor, {
          at: from,
          to: [...tablePath, row + 1, getInsertIndex(grid, row + 1, cell.origin[1])],
        });
      }
    }

    removeNodes(editor, { at: [...tablePath, row] });
  });
};

/**
 * Deletes the current cell's origin column. Cells wider than one column
 * shrink instead; rows left without cells are removed with it.
 */
export const deleteColumn = (editor: PlateEditor): void => {
  if (shouldDelegateToPlate(editor)) return deleteColumnPlate(editor);
  const current = getCurrentCell(editor, { atAnchor: true });
  if (!current) return;

  const { table, tablePath, grid, slot } = current;
  const col = slot.origin[1];

  // Like Plate: deleting the last remaining column deletes the table
  if (grid.width <= 1) {
    removeNodes(editor, { at: tablePath });
    return;
  }

  const cells = uniqueSlots(grid.slots.map((row) => row[col]));
  const removed = cells.filter((cell) => cell.colspan === 1);

  // Rows whose only own cells are removed go with them
  const { rows: emptiedRows, rowspanLoss } = getEmptiedRows(grid, removed);

  if (emptiedRows.length === grid.height) {
    removeNodes(editor, { at: tablePath });
    return;
  }

  withoutNormalizing(editor, () => {
    const spanChanges = new Set<GridSlot>([
      ...cells.filter((cell) => cell.colspan > 1),
      ...rowspanLoss.keys(),
    ]);
    for (const cell of spanChanges) {
      if (removed.includes(cell)) continue;
      setSpan(editor, getSlotPath(tablePath, cell), getSlotCell(table, cell), {
        colspan: cells.includes(cell) ? cell.colspan - 1 : cell.colspan,
        rowspan: cell.rowspan - (rowspanLoss.get(cell) ?? 0),
      });
    }

    // Bottom row first so row paths stay valid; at most one removed cell per row
    for (let r = grid.height - 1; r >= 0; r--) {
      if (emptiedRows.includes(r)) {
        removeNodes(editor, { at: [...tablePath, r] });
        continue;
      }
      const cell = removed.find((c) => c.origin[0] === r);
      if (cell) removeNodes(editor, { at: getSlotPath(tablePath, cell) });
    }
  });
};
