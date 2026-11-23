import { describe, expect, it } from 'vitest';

import { getInsertIndex, getSpan, getTableGrid, spanData } from '../grid';

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
