/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { BLOCKS } from '@contentful/rich-text-types';
import { describe, expect, it } from 'vitest';

import { assertOutput, createTestEditor, jsx } from '../../../test-utils';

describe('normalization', () => {
  describe('Table', () => {
    it('removes empty table nodes', () => {
      const input = (
        <editor>
          <htable />
        </editor>
      );

      const expected = (
        <editor>
          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('moves tables to the root level except nested tables', () => {
      const table = (
        <htable>
          <htr>
            <htd>
              <hp>Cell 1</hp>
            </htd>
            <htd>
              <hp>Cell 2</hp>
            </htd>
          </htr>
        </htable>
      );

      const input = (
        <editor>
          {/* Inside Paragraphs */}
          <hp>
            hello
            {table}
          </hp>

          {/* Inside quotes */}
          <hquote>
            <hp>
              quote
              {table}
            </hp>
          </hquote>

          {/* Inside lists */}
          <hul>
            <hli>
              <hp>
                item
                {table}
              </hp>
            </hli>
          </hul>

          {/* Nested tables */}
          <htable>
            <htr>
              <htd>
                <hp>cell with table: {table}</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      );

      const expected = (
        <editor>
          <hp>hello</hp>

          {table}

          <hquote>
            <hp>quote</hp>
          </hquote>

          {table}

          <hul>
            <hli>
              <hp>item</hp>
            </hli>
          </hul>

          {table}

          <htable>
            <htr>
              <htd>
                <hp>cell with table: </hp>
                <hp>Cell 1</hp>
                <hp>Cell 2</hp>
              </htd>
            </htr>
          </htable>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('removes invalid children', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
              </htd>
            </htr>
            <htd>invalid cell</htd>
            invalid text
          </htable>
          <hp />
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });

  describe('Table cell', () => {
    it('converts invalid children to paragraphs', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
                <hquote>
                  <hp>
                    <htext bold italic underline>
                      quote
                    </htext>
                    <hinline type="Entry" id="entry-id" />
                  </hp>
                </hquote>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
                <hp>
                  <htext bold italic underline>
                    quote
                  </htext>
                  <hinline type="Entry" id="entry-id" />
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });

  describe('Table row', () => {
    it('must be wrapped in a table', () => {
      const input = (
        <editor>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell</hp>
              </htd>
            </htr>
          </htable>

          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('removes empty rows', () => {
      const input = (
        <editor>
          <htr />
        </editor>
      );

      const expected = (
        <editor>
          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('wraps invalid children in table cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
              <hp>cell 2</hp>
            </htr>
          </htable>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
              <htd>
                <hp>cell 2</hp>
              </htd>
            </htr>
          </htable>

          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('ensures all table rows have the same width', () => {
      const input = (
        <editor>
          <htable>
            {/* 1 column */}
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
            </htr>

            {/* 3 columns */}
            <htr>
              <htd>
                <hp>cell 2</hp>
              </htd>
              <htd>
                <hp>cell 3</hp>
              </htd>
              <htd>
                <hp>cell 4</hp>
              </htd>
            </htr>

            {/* 2 columns */}
            <htr>
              <htd>
                <hp>cell 5</hp>
              </htd>
              <htd>
                <hp>cell 6</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
              <htd>
                <hp>
                  <text />
                </hp>
              </htd>
              <htd>
                <hp>
                  <text />
                </hp>
              </htd>
            </htr>

            <htr>
              <htd>
                <hp>cell 2</hp>
              </htd>
              <htd>
                <hp>cell 3</hp>
              </htd>
              <htd>
                <hp>cell 4</hp>
              </htd>
            </htr>

            <htr>
              <htd>
                <hp>cell 5</hp>
              </htd>
              <htd>
                <hp>cell 6</hp>
              </htd>
              <htd>
                <hp>
                  <text />
                </hp>
              </htd>
            </htr>
          </htable>

          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });
});

describe('paste', () => {
  const paragraph = (value: string) => ({ type: BLOCKS.PARAGRAPH, children: [{ text: value }] });
  const table = (rows: string[][]) => ({
    type: BLOCKS.TABLE,
    children: rows.map((cells) => ({
      type: BLOCKS.TABLE_ROW,
      children: cells.map((value) => ({ type: BLOCKS.TABLE_CELL, children: [paragraph(value)] })),
    })),
  });

  it.each([
    {
      name: 'rows',
      cells: [
        ['A1', 'B1'],
        ['A2', 'B2'],
      ],
    },
    { name: 'columns', cells: [['A1', 'B1', 'C1']] },
  ])('expands table $name when pasting text and a table into a cell', ({ cells }) => {
    const { editor } = createTestEditor({});
    editor.children = [table([['Old A', 'Old B']]), paragraph('Keep following paragraph')];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 2 });

    // Plate drops the leading paragraph and overwrites the target cells, matching upstream.
    editor.insertFragment([paragraph('Before table'), table(cells)]);

    expect(editor.children).toMatchObject([table(cells), paragraph('Keep following paragraph')]);
    editor.insertText('!');
    const lastRow = cells.length - 1;
    const lastCol = cells[lastRow].length - 1;
    expect(editor.api.string([0, lastRow, lastCol])).toBe(`${cells[lastRow][lastCol]}!`);
  });

  it('pastes a paragraph into a cell without expanding the table', () => {
    const { editor } = createTestEditor({});
    editor.children = [
      table([['Before after', 'Keep cell']]),
      paragraph('Keep following paragraph'),
    ];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 7 });

    editor.insertFragment([paragraph('pasted ')]);

    expect(editor.children).toMatchObject([
      table([['Before pasted after', 'Keep cell']]),
      paragraph('Keep following paragraph'),
    ]);
  });
});
