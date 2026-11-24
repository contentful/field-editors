import { describe, expect, it } from 'vitest';

import {
  getInsertIndex,
  getMissingCellCounts,
  getSpan,
  getTableGrid,
  MAX_SPANNED_COLUMNS,
  spanData,
} from '../grid';

const cell = (data?: object): any => ({ type: 'table-cell', data: data ?? {}, children: [] });
const row = (...cells: any[]): any => ({ type: 'table-row', data: {}, children: cells });
const table = (...rows: any[]): any => ({ type: 'table', data: {}, children: rows });

describe('getTableGrid', () => {
  it('handles a plain 2x2 table', () => {
    const grid = getTableGrid(table(row(cell(), cell()), row(cell(), cell())));
    expect(grid.width).toBe(2);
    expect(grid.height).toBe(2);
    expect(grid.slots[1][1]).toEqual({
      rowIndex: 1,
      cellIndex: 1,
      origin: [1, 1],
      colspan: 1,
      rowspan: 1,
    });
  });

  it('spreads a colspan across slots', () => {
    const grid = getTableGrid(table(row(cell({ colspan: 2 })), row(cell(), cell())));
    expect(grid.slots[0][0]?.origin).toEqual([0, 0]);
    expect(grid.slots[0][1]?.origin).toEqual([0, 0]);
    expect(grid.width).toBe(2);
  });

  it('skips slots claimed by a rowspan from above', () => {
    const grid = getTableGrid(table(row(cell({ rowspan: 2 }), cell()), row(cell())));
    expect(grid.slots[1][0]?.origin).toEqual([0, 0]);
    expect(grid.slots[1][1]).toMatchObject({ rowIndex: 1, cellIndex: 0, origin: [1, 1] });
  });

  it('leaves unfilled slots undefined in short rows', () => {
    const grid = getTableGrid(table(row(cell(), cell(), cell()), row(cell())));
    expect(grid.slots[1][1]).toBeUndefined();
    expect(grid.slots[1][2]).toBeUndefined();
    expect(grid.width).toBe(3);
  });

  it('does not shrink a wide colspan', () => {
    const grid = getTableGrid(table(row(cell({ colspan: 3 })), row(cell(), cell())));
    expect(grid.width).toBe(3);
    expect(grid.slots[1][2]).toBeUndefined();
  });

  it('only fills existing rows for a rowspan past the last row', () => {
    const grid = getTableGrid(table(row(cell()), row(cell({ rowspan: 5 }))));
    expect(grid.height).toBe(2);
    expect(grid.slots[1][0]?.rowspan).toBe(5);
  });

  it(`clamps colspans that would widen the table past ${MAX_SPANNED_COLUMNS} columns`, () => {
    const grid = getTableGrid(table(row(cell({ colspan: 1000 }))));
    expect(grid.width).toBe(MAX_SPANNED_COLUMNS);
    expect(grid.cells[0][0].colspan).toBe(MAX_SPANNED_COLUMNS);
  });

  it('collapses columns no cell starts in when padding would outgrow the table', () => {
    // Padding to the colspan would add 99 cells to each of the other rows
    const grid = getTableGrid(table(row(cell({ colspan: 1000 })), row(cell()), row(cell())));
    expect(grid.width).toBe(1);
    expect(grid.cells[0][0].colspan).toBe(1);
    expect(getMissingCellCounts(grid)).toEqual([0, 0, 0]);
  });

  it('collapses only the redundant columns, keeping the ones cells start in', () => {
    // Columns 0, 1 and 50 have cells starting in them; columns 2-49 and 51-99 don't
    const grid = getTableGrid(
      table(
        row(cell(), cell({ colspan: 49 }), cell({ colspan: 1000 })),
        row(cell()),
        row(cell()),
        row(cell()),
      ),
    );
    expect(grid.width).toBe(3);
    expect(grid.cells[0].map((slot) => slot.colspan)).toEqual([1, 1, 1]);
    expect(getMissingCellCounts(grid)).toEqual([0, 2, 2, 2]);
  });

  it('keeps a redundant column when no padding is needed', () => {
    // Every row merges both columns: column 1 is redundant, but the table is
    // already rectangular, so legitimately merged content is left alone
    const grid = getTableGrid(table(row(cell({ colspan: 2 })), row(cell({ colspan: 2 }))));
    expect(grid.width).toBe(2);
    expect(grid.cells[1][0].colspan).toBe(2);
  });

  it('keeps a wide colspan when padding stays within the size of the table', () => {
    const grid = getTableGrid(table(row(cell({ colspan: 3 })), row(cell(), cell())));
    expect(grid.width).toBe(3);
    expect(getMissingCellCounts(grid)).toEqual([0, 1]);
  });

  it('clamps a colspan so it ends at the column limit', () => {
    const grid = getTableGrid(table(row(cell({ colspan: 98 }), cell(), cell({ colspan: 5 }))));
    expect(grid.cells[0].map((slot) => slot.colspan)).toEqual([98, 1, 1]);
    expect(grid.width).toBe(MAX_SPANNED_COLUMNS);
  });

  it('lets colspans reach the widest row when it has more real cells than the limit', () => {
    const wideRow = row(...Array.from({ length: 150 }, () => cell()));
    const grid = getTableGrid(table(row(cell({ colspan: 1000 })), wideRow));
    expect(grid.width).toBe(150);
    expect(grid.cells[0][0].colspan).toBe(150);
  });

  it('keeps grid size proportional to content for a row of many wide colspans', () => {
    // 1000 cells of colspan 1000 used to build a 1,000,000-column grid and
    // rescan each row from column 0 for every cell
    const cells = Array.from({ length: 1000 }, () => cell({ colspan: 1000 }));
    const grid = getTableGrid(table(row(...cells)));
    expect(grid.width).toBe(1999);
    expect(grid.cells[0][0].colspan).toBe(1000);
    expect(grid.cells[0][999]).toMatchObject({ origin: [0, 1998], colspan: 1 });
  });

  it('records every cell placement in cells, even when a later cell overlaps it', () => {
    const grid = getTableGrid(table(row(cell({ rowspan: 2 }), cell()), row(cell({ colspan: 2 }))));
    expect(grid.cells[1][0]).toMatchObject({ origin: [1, 1], colspan: 2 });
    expect(grid.cells[0][0]).toMatchObject({ origin: [0, 0], rowspan: 2 });
  });

  it('returns the same grid for the same table node', () => {
    const node = table(row(cell(), cell()));
    expect(getTableGrid(node)).toBe(getTableGrid(node));
  });
});

describe('getMissingCellCounts', () => {
  it('counts slots covered by rowspans from above as filled', () => {
    const grid = getTableGrid(
      table(row(cell({ rowspan: 2 }), cell(), cell()), row(cell()), row(cell())),
    );
    expect(getMissingCellCounts(grid)).toEqual([0, 1, 2]);
  });
});

describe('getSpan', () => {
  it.each([[{ colspan: 0 }], [{ colspan: 1.5 }], [{ colspan: '2' }], [{}]])(
    'falls back to 1 for %j',
    (data) => {
      expect(getSpan({ data } as any)).toEqual({ colspan: 1, rowspan: 1 });
    },
  );

  it('caps spans at the HTML maximums', () => {
    expect(getSpan({ data: { colspan: 5000, rowspan: 100000 } } as any)).toEqual({
      colspan: 1000,
      rowspan: 65534,
    });
  });

  it('reads valid spans', () => {
    expect(getSpan({ data: { colspan: 2, rowspan: 3 } } as any)).toEqual({
      colspan: 2,
      rowspan: 3,
    });
  });
});

describe('spanData', () => {
  it('omits span keys equal to 1', () => {
    expect(spanData({ foo: 1 }, { colspan: 1, rowspan: 2 })).toEqual({ foo: 1, rowspan: 2 });
    expect('colspan' in spanData({ colspan: 3 }, { colspan: 1, rowspan: 1 })).toBe(false);
  });
});

describe('getInsertIndex', () => {
  it('counts cells originating in the row left of the column', () => {
    const grid = getTableGrid(
      table(row(cell({ rowspan: 2 }), cell(), cell()), row(cell(), cell())),
    );
    expect(getInsertIndex(grid, 1, 0)).toBe(0);
    expect(getInsertIndex(grid, 1, 1)).toBe(0);
    expect(getInsertIndex(grid, 1, 2)).toBe(1);
  });
});
