import { BLOCKS } from '@contentful/rich-text-types';

import { getAboveNode } from '../../../internal/queries';
import { setNodes } from '../../../internal/transforms';
import { Element, Path, PlateEditor } from '../../../internal/types';
import { GridSlot, Span, TableGrid, getCellSlot, getTableGrid, spanData } from '../grid';

/** The cell an action applies to, with the table snapshot it was resolved from */
export type CurrentCell = { table: Element; tablePath: Path; grid: TableGrid; slot: GridSlot };

type GetCurrentCellOptions = {
  /**
   * Resolve the cell at the selection's anchor, so a selection across
   * several cells still has one. Without it, such a selection has no current cell.
   */
  atAnchor?: boolean;
};

export const getCurrentCell = (
  editor: PlateEditor,
  { atAnchor = false }: GetCurrentCellOptions = {},
): CurrentCell | undefined => {
  const at = atAnchor ? editor.selection?.anchor : undefined;
  const cellEntry = getAboveNode(editor, {
    at,
    match: { type: [BLOCKS.TABLE_CELL, BLOCKS.TABLE_HEADER_CELL] },
  });
  const tableEntry = getAboveNode(editor, { at, match: { type: BLOCKS.TABLE } });
  if (!cellEntry || !tableEntry) return undefined;

  const [, path] = cellEntry;
  const [table, tablePath] = tableEntry as [Element, Path];
  if (path.length !== tablePath.length + 2) return undefined;

  const grid = getTableGrid(table);
  const slot = getCellSlot(grid, path[path.length - 2], path[path.length - 1]);
  return { table, tablePath, grid, slot };
};

/** The cell node owning `slot` in the `table` snapshot the grid was built from */
export const getSlotCell = (table: Element, slot: GridSlot): Element =>
  (table.children[slot.rowIndex] as Element).children[slot.cellIndex] as Element;

/** The path of the cell owning `slot`, valid until rows or cells before it change */
export const getSlotPath = (tablePath: Path, slot: GridSlot): Path => [
  ...tablePath,
  slot.rowIndex,
  slot.cellIndex,
];

/** Writes `span` to the cell at `cellPath`, keeping its other data */
export const setSpan = (editor: PlateEditor, cellPath: Path, cell: Element, span: Span): void => {
  setNodes(editor, { data: spanData(cell.data as object | undefined, span) }, { at: cellPath });
};

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
