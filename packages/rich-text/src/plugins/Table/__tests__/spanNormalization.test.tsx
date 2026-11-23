/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { getTableSize } from '../../../helpers/editor';
import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { setHeader } from '../actions';
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

  it('caps colspan above the HTML maximum', () => {
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
            <htd data={{ colspan: 1000 }}>
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
