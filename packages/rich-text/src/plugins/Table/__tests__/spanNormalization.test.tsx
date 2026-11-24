/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { getTableSize } from '../../../helpers/editor';
import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { setHeader } from '../actions';
import { MAX_SPANNED_COLUMNS } from '../grid';
import { isTableHeaderEnabled } from '../helpers';

const empty = (
  <hp>
    <htext />
  </hp>
);

describe('table normalization with spans', () => {
  it('leaves valid colspan content unchanged', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 2 }}>
              <hp>A</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
            <htd>
              <hp>C</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected: input });
  });

  it('leaves valid rowspan content unchanged', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ rowspan: 2 }}>
              <hp>A</hp>
            </htd>
            <htd>
              <hp>B</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>C</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected: input });
  });

  it('pads other rows around a wide colspan', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 3 }}>
              <hp>A</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
            <htd>
              <hp>C</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 3 }}>
              <hp>A</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
            <htd>
              <hp>C</hp>
            </htd>
            <htd>
              <hp>
                <htext />
              </hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected });
  });

  it('clamps rowspan past the last row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ rowspan: 5 }}>
              <hp>A</hp>
            </htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{ rowspan: 2 }}>
              <hp>A</hp>
            </htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected });
  });

  it('clamps rowspan after an empty row is removed', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ rowspan: 3 }}>
              <hp>A</hp>
            </htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
          </htr>
          <htr />
        </htable>
        {empty}
      </editor>
    );
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{ rowspan: 2 }}>
              <hp>A</hp>
            </htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected });
  });

  it('caps colspan at the column limit', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 5000 }}>
              <hp>A</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: MAX_SPANNED_COLUMNS }}>
              <hp>A</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected });
  });

  it('removes invalid and redundant span keys', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 1, rowspan: 0 }}>
              <hp>A</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{}}>
              <hp>A</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected });
  });

  it('does not change span-free tables', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>A</hp>
            </htd>
            <htd>
              <hp>B</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>C</hp>
            </htd>
            <htd>
              <hp>D</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    assertOutput({ input, expected: input });
  });

  it('header toggle works with spans', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 2 }}>
              <hp>
                A<cursor />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
            <htd>
              <hp>C</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const { editor, normalize } = createTestEditor({ input });
    normalize();
    setHeader(editor, true);
    const table = editor.children[0] as any;
    expect(table.children[0].children[0].type).toBe('table-header-cell');
    expect(table.children[0].children[0].data).toEqual({ colspan: 2 });
    expect(isTableHeaderEnabled(editor)).toBe(true);
  });
});

describe('malformed tables', () => {
  it('normalizes a table with a stray text child without throwing', () => {
    const input = (
      <editor>
        <htable>
          stray
          <htr>
            <htd>
              <hp>A</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const { normalize } = createTestEditor({ input });
    expect(() => normalize()).not.toThrow();
  });

  it('clamps a crafted wide colspan instead of padding every row with hundreds of cells', () => {
    const otherRows = Array.from({ length: 50 }, (_, i) => ({
      type: 'table-row',
      data: {},
      children: [
        {
          type: 'table-cell',
          data: {},
          children: [{ type: 'paragraph', data: {}, children: [{ text: `row ${i + 1}` }] }],
        },
      ],
    }));
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 1000 }}>
              <hp>wide</hp>
            </htd>
          </htr>
          {otherRows}
        </htable>
        {empty}
      </editor>
    );
    const { editor, normalize } = createTestEditor({ input });
    normalize();

    const table = editor.children[0] as any;
    // No cell starts in columns 2-1000, so they collapse: the table renders the
    // same and needs no padding. Previously each of the 50 rows was padded to
    // 1000 cells (~50k cells in total).
    expect(table.children[0].children[0].data).toEqual({});
    expect(table.children.map((r: any) => r.children.length)).toEqual(Array(51).fill(1));
    expect(table.children[1].children[0].children[0].children[0].text).toBe('row 1');
  });

  it('pads every short row of a table in one normalization pass', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>A</hp>
            </htd>
            <htd>
              <hp>B</hp>
            </htd>
            <htd>
              <hp>C</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>D</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>E</hp>
            </htd>
            <htd>
              <hp>F</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const { editor, normalize } = createTestEditor({ input });
    normalize();

    const table = editor.children[0] as any;
    expect(table.children.map((r: any) => r.children.length)).toEqual([3, 3, 3]);
  });
});

describe('getTableSize', () => {
  it('uses the grid width', () => {
    const cell = (data = {}): any => ({ type: 'table-cell', data, children: [] });
    const row = (...cells: any[]): any => ({ type: 'table-row', data: {}, children: cells });
    const table: any = {
      type: 'table',
      data: {},
      children: [row(cell({ colspan: 2 })), row(cell(), cell())],
    };
    expect(getTableSize(table)).toEqual({ numRows: 2, numColumns: 2 });
  });
});
