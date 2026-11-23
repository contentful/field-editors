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
  width: number;
  height: number;
};

// HTML spec maxima, so crafted content cannot make the grid allocate unbounded slots
export const MAX_COLSPAN = 1000;
export const MAX_ROWSPAN = 65534;

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

export function getTableGrid(table: Element): TableGrid {
  const rows = table.children as Element[];
  const height = rows.length;
  const slots: (GridSlot | undefined)[][] = rows.map(() => []);

  rows.forEach((row, rowIndex) => {
    if (!isElement(row) || !Array.isArray(row.children)) return;
    (row.children as Element[]).forEach((cell, cellIndex) => {
      if (!isElement(cell)) return;
      const { colspan, rowspan } = getSpan(cell);
      let col = 0;
      while (slots[rowIndex][col]) col++;
      const slot: GridSlot = { rowIndex, cellIndex, origin: [rowIndex, col], colspan, rowspan };
      // Malformed overlapping spans (this cell's area running into slots another
      // cell already owns, e.g. a colspan into a rowspan from above) resolve
      // last-writer-wins. They are not repaired here.
      for (let r = rowIndex; r < Math.min(rowIndex + rowspan, height); r++) {
        for (let c = col; c < col + colspan; c++) {
          slots[r][c] = slot;
        }
      }
    });
  });

  const width = slots.reduce((max, row) => Math.max(max, row.length), 0);
  // Normalize sparse arrays so every row has `width` entries (holes -> undefined).
  const dense = slots.map((row) => Array.from({ length: width }, (_, c) => row[c]));
  return { slots: dense, width, height };
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
