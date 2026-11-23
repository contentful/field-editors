import { GridSlot, TableGrid } from '../grid';

/** Unique cells among `slots`, in the order they first appear */
export const uniqueSlots = (slots: (GridSlot | undefined)[]): GridSlot[] =>
  slots.filter((slot, i): slot is GridSlot => !!slot && slots.indexOf(slot) === i);

export type EmptiedRows = {
  /** Rows whose own cells are all being removed, top to bottom */
  rows: number[];
  /** How many emptied rows each surviving cell spans across */
  rowspanLoss: Map<GridSlot, number>;
};

/**
 * Finds the rows that removing `removed` would leave without cells of their
 * own. Those rows must be removed with them (the row normalizer would delete
 * them anyway, shifting the rows below), and every cell crossing them shrinks.
 */
export function getEmptiedRows(grid: TableGrid, removed: GridSlot[]): EmptiedRows {
  const rows = grid.slots
    .map((rowSlots, r) => {
      const own = uniqueSlots(rowSlots).filter((cell) => cell.origin[0] === r);
      return own.length > 0 && own.every((cell) => removed.includes(cell)) ? r : -1;
    })
    .filter((r) => r >= 0);

  const rowspanLoss = new Map<GridSlot, number>();
  for (const r of rows) {
    for (const cell of uniqueSlots(grid.slots[r])) {
      if (cell.origin[0] < r) rowspanLoss.set(cell, (rowspanLoss.get(cell) ?? 0) + 1);
    }
  }

  return { rows, rowspanLoss };
}
