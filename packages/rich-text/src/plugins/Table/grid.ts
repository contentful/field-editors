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

const toSpanValue = (value: unknown): number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : 1;

export function getSpan(cell: Element): Span {
  const data = (cell.data ?? {}) as { colspan?: unknown; rowspan?: unknown };
  return { colspan: toSpanValue(data.colspan), rowspan: toSpanValue(data.rowspan) };
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
    (row.children as Element[]).forEach((cell, cellIndex) => {
      const { colspan, rowspan } = getSpan(cell);
      let col = 0;
      while (slots[rowIndex][col]) col++;
      const slot: GridSlot = { rowIndex, cellIndex, origin: [rowIndex, col], colspan, rowspan };
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
