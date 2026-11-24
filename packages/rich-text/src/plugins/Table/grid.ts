import { isElement } from '../../internal/queries';
import { Element } from '../../internal/types';

export type Span = { colspan: number; rowspan: number };

export type GridSlot = {
  rowIndex: number;
  cellIndex: number;
  origin: [number, number];
  colspan: number;
  rowspan: number;
};

export type TableGrid = {
  slots: (GridSlot | undefined)[][];
  /** Each cell's placement, indexed by [rowIndex][cellIndex], even if a later cell overlaps it */
  cells: GridSlot[][];
  width: number;
  height: number;
};

// HTML spec maxima, so crafted content cannot make the grid allocate unbounded slots
export const MAX_COLSPAN = 1000;
export const MAX_ROWSPAN = 65534;

/**
 * Colspans may widen a table to at most this many columns, or to its widest
 * row's cell count if that is larger. Colspans that would go further are
 * clamped. This bounds the memory a crafted colspan can make the grid use.
 */
export const MAX_SPANNED_COLUMNS = 100;

const toSpanValue = (value: unknown, max: number): number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 ? Math.min(value, max) : 1;

export function getSpan(cell: Element): Span {
  const data = (cell.data ?? {}) as { colspan?: unknown; rowspan?: unknown };
  return {
    colspan: toSpanValue(data.colspan, MAX_COLSPAN),
    rowspan: toSpanValue(data.rowspan, MAX_ROWSPAN),
  };
}

export function spanData(data: object | undefined, span: Span): object {
  const rest = { ...(data ?? {}) } as Record<string, unknown>;
  delete rest.colspan;
  delete rest.rowspan;
  return {
    ...rest,
    ...(span.colspan !== 1 ? { colspan: span.colspan } : {}),
    ...(span.rowspan !== 1 ? { rowspan: span.rowspan } : {}),
  };
}

/** Number of empty slots each row needs filled to reach the table width */
export const getMissingCellCounts = (grid: TableGrid): number[] =>
  grid.slots.map((row) => grid.width - row.filter(Boolean).length);

// Slate nodes are immutable, so a table node always maps to the same grid
const gridCache = new WeakMap<Element, TableGrid>();

export function getTableGrid(table: Element): TableGrid {
  const cached = gridCache.get(table);
  if (cached) return cached;
  const grid = buildTableGrid(table);
  gridCache.set(table, grid);
  return grid;
}

const cellsOf = (row: unknown): Element[] =>
  isElement(row) && Array.isArray(row.children) ? (row.children as Element[]) : [];

// Bounds the collapse loop in buildTableGrid. Each pass strictly narrows the
// table, and normalization re-runs until the spans are stable.
const MAX_COLLAPSE_PASSES = 5;

function buildTableGrid(table: Element): TableGrid {
  const rows = table.children as Element[];
  const cellCount = rows.reduce((sum, row) => sum + cellsOf(row).filter(isElement).length, 0);
  const maxSpannedWidth = rows.reduce(
    (max, row) => Math.max(max, cellsOf(row).filter(isElement).length),
    MAX_SPANNED_COLUMNS,
  );

  let grid = placeCells(rows, (cell) => getSpan(cell).colspan, maxSpannedWidth);

  // A column that no cell starts in is redundant: removing it (and narrowing
  // every cell that spans it) renders the same table. Normally such columns
  // are kept, e.g. when every row merges the same two columns. But when filling
  // short rows would add more cells than the table already has, collapse them
  // first, so crafted spans can't make normalization pad rows out of
  // proportion to the content.
  for (let pass = 0; pass < MAX_COLLAPSE_PASSES; pass++) {
    const padding = getMissingCellCounts(grid).reduce((sum, missing) => sum + missing, 0);
    if (padding <= cellCount) break;
    const startColumns = new Set(grid.cells.flatMap((row) => row.map((slot) => slot.origin[1])));
    if (startColumns.size === grid.width) break;
    const current = grid;
    grid = placeCells(
      rows,
      (_, rowIndex, cellIndex) => {
        const { origin, colspan } = current.cells[rowIndex][cellIndex];
        let collapsed = 0;
        for (let c = origin[1]; c < origin[1] + colspan; c++) {
          if (startColumns.has(c)) collapsed++;
        }
        return collapsed;
      },
      maxSpannedWidth,
    );
  }

  return grid;
}

/**
 * Lays cells out on a grid of slots, HTML-table style, using `getColspan` for
 * each cell's colspan. Colspans are clamped to end at `maxSpannedWidth`.
 */
function placeCells(
  rows: Element[],
  getColspan: (cell: Element, rowIndex: number, cellIndex: number) => number,
  maxSpannedWidth: number,
): TableGrid {
  const height = rows.length;
  const slots: (GridSlot | undefined)[][] = rows.map(() => []);
  const cells: GridSlot[][] = rows.map(() => []);

  rows.forEach((row, rowIndex) => {
    // Cells are placed left to right, so each one starts searching where the previous one ended
    let col = 0;
    cellsOf(row).forEach((cell, cellIndex) => {
      if (!isElement(cell)) return;
      while (slots[rowIndex][col]) col++;
      const requested = getColspan(cell, rowIndex, cellIndex);
      const colspan = Math.max(1, Math.min(requested, maxSpannedWidth - col));
      const { rowspan } = getSpan(cell);
      const slot: GridSlot = { rowIndex, cellIndex, origin: [rowIndex, col], colspan, rowspan };
      cells[rowIndex][cellIndex] = slot;
      // Malformed overlapping spans (this cell's area running into slots another
      // cell already owns, e.g. a colspan into a rowspan from above) resolve
      // last-writer-wins. They are not repaired here.
      for (let r = rowIndex; r < Math.min(rowIndex + rowspan, height); r++) {
        for (let c = col; c < col + colspan; c++) {
          slots[r][c] = slot;
        }
      }
      col += colspan;
    });
  });

  const width = slots.reduce((max, row) => Math.max(max, row.length), 0);
  // Normalize sparse arrays so every row has `width` entries (holes -> undefined).
  const dense = slots.map((row) => Array.from({ length: width }, (_, c) => row[c]));
  return { slots: dense, cells, width, height };
}

/** Whether any cell in the grid spans more than one row or column */
export const hasSpans = (grid: TableGrid): boolean =>
  grid.slots.some((row) => row.some((slot) => slot && (slot.colspan > 1 || slot.rowspan > 1)));

export function getCellSlot(grid: TableGrid, rowIndex: number, cellIndex: number): GridSlot {
  for (const slot of grid.slots[rowIndex]) {
    if (slot && slot.rowIndex === rowIndex && slot.cellIndex === cellIndex) return slot;
  }
  throw new Error(`No cell at row ${rowIndex}, index ${cellIndex}`);
}

export function getInsertIndex(grid: TableGrid, row: number, col: number): number {
  const seen = new Set<GridSlot>();
  for (let c = 0; c < col; c++) {
    const slot = grid.slots[row]?.[c];
    if (slot && slot.origin[0] === row) seen.add(slot);
  }
  return seen.size;
}
