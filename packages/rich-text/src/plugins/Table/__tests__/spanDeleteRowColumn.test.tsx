/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import {
  deleteColumn as plateDeleteColumn,
  deleteRow as plateDeleteRow,
} from '../../../internal/table';
import { PlateEditor } from '../../../internal/types';
import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { deleteColumn, deleteRow } from '../actions';

const empty = (
  <hp>
    <htext />
  </hp>
);

describe('deleting rows and columns around merged cells', () => {
  describe('delete row', () => {
    it('delete row through a rowspan', () => {
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
                <hp>
                  C<cursor />
                </hp>
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
              <htd>
                <hp>A</hp>
              </htd>
              <htd>
                <hp>
                  B<cursor />
                </hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      deleteRow(editor);
      assertOutput({ editor, expected });
    });

    it('delete a row whose cell spans down', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd data={{ rowspan: 2 }}>
                <hp>
                  A<cursor />
                </hp>
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
      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  A<cursor />
                </hp>
              </htd>
              <htd>
                <hp>C</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      deleteRow(editor);
      assertOutput({ editor, expected });
    });

    it('delete a row whose cells span down moves each to its grid position', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd data={{ rowspan: 2 }}>
                <hp>A</hp>
              </htd>
              <htd>
                <hp>
                  B<cursor />
                </hp>
              </htd>
              <htd data={{ rowspan: 3 }}>
                <hp>X</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>C</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>D</hp>
              </htd>
              <htd>
                <hp>E</hp>
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
              <htd>
                <hp>A</hp>
              </htd>
              <htd>
                <hp>C</hp>
              </htd>
              <htd data={{ rowspan: 2 }}>
                <hp>X</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>D</hp>
              </htd>
              <htd>
                <hp>E</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      deleteRow(editor);
      // The cursor cell is gone; only the structure matters here
      assertOutput({ editor, expected: { ...expected, selection: null } });
    });
  });

  describe('delete column', () => {
    it('delete column through a colspan', () => {
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
                <hp>
                  C<cursor />
                </hp>
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
              <htd>
                <hp>A</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  B<cursor />
                </hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      deleteColumn(editor);
      assertOutput({ editor, expected });
    });

    it('delete column where the colspan starts', () => {
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
                <hp>
                  B<cursor />
                </hp>
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
              <htd>
                <hp>A</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />C
                </hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      deleteColumn(editor);
      assertOutput({ editor, expected });
    });

    it('delete column that empties a row removes the row and shrinks rowspans across it', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  A<cursor />
                </hp>
              </htd>
              <htd data={{ rowspan: 2 }}>
                <hp>B</hp>
              </htd>
              <htd data={{ rowspan: 2 }}>
                <hp>X</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>C</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>D</hp>
              </htd>
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
      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>B</hp>
              </htd>
              <htd>
                <hp>X</hp>
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

      const { editor } = createTestEditor({ input });
      deleteColumn(editor);
      assertOutput({ editor, expected: { ...expected, selection: null } });
    });
  });

  describe('span-free tables', () => {
    const grid2x2 = (row: number, col: number) => {
      const cell = (name: string, r: number, c: number) => (
        <htd>
          <hp>
            {name}
            {r === row && c === col ? <cursor /> : null}
          </hp>
        </htd>
      );
      return (
        <editor>
          <hp>before</hp>
          <htable>
            <htr>
              {cell('A', 0, 0)}
              {cell('B', 0, 1)}
            </htr>
            <htr>
              {cell('C', 1, 0)}
              {cell('D', 1, 1)}
            </htr>
          </htable>
          {empty}
        </editor>
      );
    };
    const singleCell = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                A<cursor />
              </hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );
    const wholeFirstRowSelected = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />A
              </hp>
            </htd>
            <htd>
              <hp>
                B<focus />
              </hp>
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

    const cases: [string, () => any][] = [
      ...[0, 1].flatMap((r) =>
        [0, 1].map((c): [string, () => any] => [`2x2, cursor at ${r},${c}`, () => grid2x2(r, c)]),
      ),
      ['single cell', () => singleCell],
      ['whole first row selected', () => wholeFirstRowSelected],
    ];

    const actions: [string, (e: PlateEditor) => void, (e: PlateEditor) => void][] = [
      ['delete row', deleteRow, plateDeleteRow as (e: PlateEditor) => void],
      ['delete column', deleteColumn, plateDeleteColumn as (e: PlateEditor) => void],
    ];

    for (const [actionName, ours, plates] of actions) {
      for (const [caseName, input] of cases) {
        it(`${actionName} behaves as before: ${caseName}`, () => {
          const { editor: expected } = createTestEditor({ input: input() });
          plates(expected);
          const { editor } = createTestEditor({ input: input() });
          ours(editor);

          expect(editor.children).toEqual(expected.children);
          expect(editor.selection).toEqual(expected.selection);
        });
      }
    }
  });

  it('undo restores the table after delete row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ rowspan: 2 }}>
              <hp>
                A<cursor />
              </hp>
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

    const { editor } = createTestEditor({ input });
    const original = editor.children;
    deleteRow(editor);
    expect(editor.children).not.toEqual(original);

    editor.undo();

    expect(editor.children).toEqual(original);
  });
});
