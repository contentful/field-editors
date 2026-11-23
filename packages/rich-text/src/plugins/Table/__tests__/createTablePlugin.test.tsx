/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { describe, expect, it, vi } from 'vitest';

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

  describe('Table cell with embedded assets', () => {
    it('keeps embedded assets in body cells, alone or next to paragraphs', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hembed type="Asset" id="asset-1" />
              </htd>
              <htd>
                <hp>before</hp>
                <hembed type="Asset" id="asset-2" />
                <hembed type="Asset" id="asset-3" />
                <hp>after</hp>
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
                <hembed type="Asset" id="asset-1" />
              </htd>
              <htd>
                <hp>before</hp>
                <hembed type="Asset" id="asset-2" />
                <hembed type="Asset" id="asset-3" />
                <hp>after</hp>
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

    it('removes embedded assets from header cells and keeps their paragraphs', () => {
      const trackingHandler = vi.fn();
      const { editor } = createTestEditor({
        trackingHandler,
        input: (
          <editor>
            <htable>
              <htr>
                <hth>
                  <hp>header</hp>
                  <hembed type="Asset" id="asset-1" />
                </hth>
              </htr>
              <htr>
                <htd>
                  <hembed type="Asset" id="asset-2" />
                </htd>
              </htr>
            </htable>
            <hp />
          </editor>
        ),
      });

      const expected = (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>header</hp>
              </hth>
            </htr>
            <htr>
              <htd>
                <hembed type="Asset" id="asset-2" />
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ editor, expected });

      expect(trackingHandler).toHaveBeenCalledWith('invalidTablePaste', {
        nodeType: BLOCKS.EMBEDDED_ASSET,
        origin: 'viewport-interaction',
      });
    });

    it('leaves an empty paragraph when a header cell only contained an asset', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <hth>
                <hembed type="Asset" id="asset-1" />
              </hth>
            </htr>
          </htable>
          <hp />
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>
                  <htext />
                </hp>
              </hth>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it.each([
      ['an embedded entry', () => <hembed type="Entry" id="entry-id" />, ['paragraph']],
      ['a heading', () => <hh1>heading</hh1>, ['paragraph', 'paragraph']],
    ])('still normalizes %s in a body cell like before', (_, createNode, expectedTypes) => {
      const { editor, normalize } = createTestEditor({
        input: (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>text</hp>
                  {createNode()}
                </htd>
              </htr>
            </htable>
            <hp />
          </editor>
        ),
      });

      normalize();

      const cell = (editor.children[0] as any).children[0].children[0];
      expect(cell.children.map((child: any) => child.type)).toEqual(expectedTypes);
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

describe('paste with embedded assets', () => {
  const paragraph = (value: string) => ({
    type: BLOCKS.PARAGRAPH,
    data: {},
    children: [{ text: value }],
  });
  const asset = (id: string) => ({
    type: BLOCKS.EMBEDDED_ASSET,
    data: { target: { sys: { id, type: 'Link', linkType: 'Asset' } } },
    isVoid: true,
    children: [{ text: '' }],
  });
  const row = (cellType: BLOCKS, ...cells: any[][]) => ({
    type: BLOCKS.TABLE_ROW,
    data: {},
    children: cells.map((children) => ({ type: cellType, data: {}, children })),
  });
  const table = (...rows: any[]) => ({ type: BLOCKS.TABLE, data: {}, children: rows });
  const cellTypes = (editor: any, rowIndex: number, cellIndex: number) =>
    editor.children[0].children[rowIndex].children[cellIndex].children.map(
      (child: any) => child.type,
    );

  it('pastes an asset into a body cell next to the text', () => {
    const { editor, normalize } = createTestEditor({});
    editor.children = [
      table(row(BLOCKS.TABLE_CELL, [paragraph('before after')])),
      paragraph('following'),
    ];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 6 });

    editor.insertFragment([asset('asset-1')]);
    normalize();

    expect(cellTypes(editor, 0, 0)).toEqual([
      BLOCKS.PARAGRAPH,
      BLOCKS.EMBEDDED_ASSET,
      BLOCKS.PARAGRAPH,
    ]);
    expect(editor.children).toHaveLength(2);
  });

  it('refuses to paste an asset into a header cell', () => {
    const { editor, normalize } = createTestEditor({});
    editor.children = [
      table(row(BLOCKS.TABLE_HEADER_CELL, [paragraph('header')])),
      paragraph('following'),
    ];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 3 });

    editor.insertFragment([asset('asset-1')]);
    normalize();

    expect(JSON.stringify(editor.children)).not.toContain(BLOCKS.EMBEDDED_ASSET);
    expect(cellTypes(editor, 0, 0)).toEqual([BLOCKS.PARAGRAPH]);
  });

  it('keeps the pasted text and refuses the asset when pasting both into a header cell', () => {
    const { editor, normalize } = createTestEditor({});
    editor.children = [
      table(row(BLOCKS.TABLE_HEADER_CELL, [paragraph('header')])),
      paragraph('following'),
    ];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 6 });

    editor.insertFragment([asset('asset-1'), paragraph('more')]);
    normalize();

    expect(JSON.stringify(editor.children)).not.toContain(BLOCKS.EMBEDDED_ASSET);
    expect(editor.api.string([0, 0, 0])).toContain('more');
  });

  it('keeps assets in body cells when pasting a whole table', () => {
    const { editor, normalize } = createTestEditor({});
    editor.children = [paragraph('before'), paragraph('')];
    editor.tf.select({ path: [1, 0], offset: 0 });

    editor.insertFragment([
      table(
        row(BLOCKS.TABLE_HEADER_CELL, [paragraph('Photo')], [paragraph('Caption')]),
        row(BLOCKS.TABLE_CELL, [asset('asset-1')], [paragraph('Sunset'), asset('asset-2')]),
      ),
    ]);
    normalize();

    const pastedTable = editor.children.find((node: any) => node.type === BLOCKS.TABLE) as any;
    const types = (rowIndex: number, cellIndex: number) =>
      pastedTable.children[rowIndex].children[cellIndex].children.map((c: any) => c.type);
    expect(types(0, 0)).toEqual([BLOCKS.PARAGRAPH]);
    expect(types(1, 0)).toEqual([BLOCKS.EMBEDDED_ASSET]);
    expect(types(1, 1)).toEqual([BLOCKS.PARAGRAPH, BLOCKS.EMBEDDED_ASSET]);
  });

  it('drops assets from header cells when pasting a whole table', () => {
    const { editor, normalize } = createTestEditor({});
    editor.children = [paragraph('before'), paragraph('')];
    editor.tf.select({ path: [1, 0], offset: 0 });

    editor.insertFragment([
      table(
        row(BLOCKS.TABLE_HEADER_CELL, [paragraph('Photo'), asset('asset-1')]),
        row(BLOCKS.TABLE_CELL, [paragraph('Sunset')]),
      ),
    ]);
    normalize();

    expect(JSON.stringify(editor.children)).not.toContain(BLOCKS.EMBEDDED_ASSET);
  });
});

describe('backward deletion', () => {
  const paragraph = (value = '') => ({ type: BLOCKS.PARAGRAPH, children: [{ text: value }] });
  const emptyTable = {
    type: BLOCKS.TABLE,
    children: [
      {
        type: BLOCKS.TABLE_ROW,
        children: [
          { type: BLOCKS.TABLE_HEADER_CELL, children: [paragraph()] },
          { type: BLOCKS.TABLE_HEADER_CELL, children: [paragraph()] },
        ],
      },
      {
        type: BLOCKS.TABLE_ROW,
        children: [
          { type: BLOCKS.TABLE_CELL, children: [paragraph()] },
          { type: BLOCKS.TABLE_CELL, children: [paragraph()] },
        ],
      },
    ],
  };

  it('removes an empty table when Backspace is pressed at the start of its first cell', () => {
    const { editor } = createTestEditor({});
    editor.children = [emptyTable, paragraph()];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 0 });

    editor.deleteBackward('character');

    expect(editor.children).toMatchObject([paragraph()]);
    expect(editor.selection?.anchor.path).toEqual([0, 0]);
  });

  it('removes an empty table when Backspace is pressed at the start of the following paragraph', () => {
    const { editor } = createTestEditor({});
    editor.children = [emptyTable, paragraph()];
    editor.tf.select({ path: [1, 0], offset: 0 });

    editor.deleteBackward('character');

    expect(editor.children).toMatchObject([paragraph()]);
    expect(editor.selection?.anchor.path).toEqual([0, 0]);
  });

  it('keeps a populated table when Backspace is pressed at the start of its first cell', () => {
    const { editor } = createTestEditor({});
    const populatedTable = {
      ...emptyTable,
      children: emptyTable.children.map((row, rowIndex) => ({
        ...row,
        children: row.children.map((cell, cellIndex) =>
          rowIndex === 0 && cellIndex === 0 ? { ...cell, children: [paragraph('content')] } : cell,
        ),
      })),
    };
    editor.children = [populatedTable, paragraph()];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 0 });

    editor.deleteBackward('character');

    expect(editor.children).toMatchObject([populatedTable, paragraph()]);
  });

  it('does not remove the empty table before a populated table', () => {
    const { editor } = createTestEditor({});
    const populatedTable = {
      ...emptyTable,
      children: emptyTable.children.map((row, rowIndex) => ({
        ...row,
        children: row.children.map((cell, cellIndex) =>
          rowIndex === 0 && cellIndex === 0 ? { ...cell, children: [paragraph('content')] } : cell,
        ),
      })),
    };
    editor.children = [emptyTable, populatedTable, paragraph()];
    editor.tf.select({ path: [1, 0, 0, 0, 0], offset: 0 });

    editor.deleteBackward('character');

    expect(editor.children).toMatchObject([emptyTable, populatedTable, paragraph()]);
  });

  it.each([
    {
      title: 'whitespace in another cell',
      table: {
        ...emptyTable,
        children: emptyTable.children.map((row, rowIndex) => ({
          ...row,
          children: row.children.map((cell, cellIndex) =>
            rowIndex === 1 && cellIndex === 1 ? { ...cell, children: [paragraph(' ')] } : cell,
          ),
        })),
      },
    },
    {
      title: 'an embedded inline in another cell',
      table: {
        ...emptyTable,
        children: emptyTable.children.map((row, rowIndex) => ({
          ...row,
          children: row.children.map((cell, cellIndex) =>
            rowIndex === 1 && cellIndex === 1
              ? {
                  ...cell,
                  children: [
                    {
                      type: BLOCKS.PARAGRAPH,
                      children: [
                        {
                          type: INLINES.EMBEDDED_ENTRY,
                          data: { target: {} },
                          children: [{ text: '' }],
                        },
                      ],
                    },
                  ],
                }
              : cell,
          ),
        })),
      },
    },
  ])('keeps a table with $title', ({ table }) => {
    const { editor } = createTestEditor({});
    editor.children = [table, paragraph()];
    editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 0 });

    editor.deleteBackward('character');

    expect(editor.children).toMatchObject([table, paragraph()]);
  });

  it('keeps a table when Backspace is pressed inside a non-first cell', () => {
    const { editor } = createTestEditor({});
    const populatedTable = {
      ...emptyTable,
      children: emptyTable.children.map((row, rowIndex) => ({
        ...row,
        children: row.children.map((cell, cellIndex) =>
          rowIndex === 0 && cellIndex === 1 ? { ...cell, children: [paragraph('x')] } : cell,
        ),
      })),
    };
    editor.children = [populatedTable, paragraph()];
    editor.tf.select({ path: [0, 0, 1, 0, 0], offset: 1 });

    editor.deleteBackward('character');

    expect(editor.children).toMatchObject([emptyTable, paragraph()]);
  });

  it('keeps an unselected preceding table when a range in the following paragraph is deleted', () => {
    const { editor } = createTestEditor({});
    editor.children = [emptyTable, paragraph('selected')];
    editor.tf.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 8 },
    });

    editor.deleteBackward('character');

    expect(editor.children[0]).toMatchObject(emptyTable);
  });

  it('keeps an empty table before a heading when Backspace is pressed in the heading', () => {
    const { editor } = createTestEditor({});
    editor.children = [
      emptyTable,
      { type: BLOCKS.HEADING_1, children: [{ text: 'content' }] },
      paragraph(),
    ];
    editor.tf.select({ path: [1, 0], offset: 0 });

    editor.deleteBackward('character');

    expect(editor.children).toMatchObject([
      emptyTable,
      { type: BLOCKS.HEADING_1, children: [{ text: 'content' }] },
      paragraph(),
    ]);
  });
});
