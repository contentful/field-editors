/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { PlateEditor } from '../../../internal/plate';
import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { canMergeDown, canMergeRight, mergeCellDown, mergeCellRight } from '../actions';
import { createTablePlugin } from '../createTablePlugin';

const empty = (
  <hp>
    <htext />
  </hp>
);

const fireTab = (editor: PlateEditor, { shiftKey = false } = {}) => {
  const tablePlugin = createTablePlugin();
  const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
  tablePlugin.handlers!.onKeyDown!(editor as any, tablePlugin as any)(event as any);
  return event;
};

describe('merging table cells', () => {
  it('merges right', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                A<cursor />
              </hp>
            </htd>
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
            <htd data={{ colspan: 2 }}>
              <hp>A</hp>
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
    mergeCellRight(editor);
    assertOutput({ editor, expected });
  });

  it('merges down', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                A<cursor />
              </hp>
            </htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>B</hp>
            </htd>
            <htd>
              <hp>Y</hp>
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
              <hp>
                B<cursor />
              </hp>
            </htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>Y</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    mergeCellDown(editor);
    assertOutput({ editor, expected });
  });

  it('skips empty neighbour content', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                A<cursor />
              </hp>
            </htd>
            <htd>{empty}</htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 2 }}>
              <hp>
                A<cursor />
              </hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    mergeCellRight(editor);
    assertOutput({ editor, expected });
  });

  it('drops the empty current cell paragraph when the neighbour has content', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />
              </hp>
            </htd>
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
            <htd data={{ colspan: 2 }}>
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
    mergeCellRight(editor);
    assertOutput({ editor, expected });
  });

  it('keeps one empty paragraph when both cells are empty', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />
              </hp>
            </htd>
            <htd>{empty}</htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 2 }}>
              <hp>
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    mergeCellRight(editor);
    assertOutput({ editor, expected });
  });

  it('keeps lists when merging', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hul>
                <hli>
                  <hp>one</hp>
                </hli>
                <hli>
                  <hp>
                    two
                    <cursor />
                  </hp>
                </hli>
              </hul>
            </htd>
            <htd>
              <hol>
                <hli>
                  <hp>three</hp>
                </hli>
              </hol>
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
            <htd data={{ colspan: 2 }}>
              <hul>
                <hli>
                  <hp>one</hp>
                </hli>
                <hli>
                  <hp>two</hp>
                </hli>
              </hul>
              <hol>
                <hli>
                  <hp>
                    three
                    <cursor />
                  </hp>
                </hli>
              </hol>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    mergeCellRight(editor);
    assertOutput({ editor, expected });
  });

  it('builds a 2x2 block from repeated merges in a wider table', () => {
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
            <htd data={{ colspan: 2, rowspan: 2 }}>
              <hp>A</hp>
              <hp>B</hp>
              <hp>D</hp>
              <hp>
                E<cursor />
              </hp>
            </htd>
            <htd>
              <hp>C</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>F</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    editor.tf.select(editor.api.end([0, 0, 0])!);
    mergeCellRight(editor);
    editor.tf.select(editor.api.end([0, 1, 0])!);
    mergeCellRight(editor);
    editor.tf.select(editor.api.end([0, 0, 0])!);
    expect(canMergeDown(editor)).toBe(true);
    mergeCellDown(editor);

    assertOutput({ editor, expected });
  });

  it('removes the emptied row when repeated merges cover a full-width table', () => {
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

    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 2 }}>
              <hp>A</hp>
              <hp>B</hp>
              <hp>C</hp>
              <hp>
                D<cursor />
              </hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    editor.tf.select(editor.api.end([0, 0, 0])!);
    mergeCellRight(editor);
    editor.tf.select(editor.api.end([0, 1, 0])!);
    mergeCellRight(editor);
    editor.tf.select(editor.api.end([0, 0, 0])!);
    mergeCellDown(editor);

    assertOutput({ editor, expected });
  });

  describe('canMergeRight', () => {
    it('is false in the last column', () => {
      const input = (
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
      expect(canMergeRight(editor)).toBe(false);

      const before = editor.children;
      mergeCellRight(editor);
      expect(editor.children).toBe(before);
    });

    it('is false when the right neighbour has a different rowspan', () => {
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
      expect(canMergeRight(editor)).toBe(false);
    });

    it('is false when the right neighbour has the same rowspan but a different origin row', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>P</hp>
              </htd>
              <htd data={{ rowspan: 2 }}>
                <hp>N</hp>
              </htd>
            </htr>
            <htr>
              <htd data={{ rowspan: 2 }}>
                <hp>
                  Q<cursor />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>R</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      // Valid content: normalization leaves it unchanged
      assertOutput({ input, expected: input });

      const { editor } = createTestEditor({ input });
      expect(canMergeRight(editor)).toBe(false);
    });

    it('is true for a neighbour with the same top row and rowspan', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  A<cursor />
                </hp>
              </htd>
              <htd>
                <hp>B</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      expect(canMergeRight(editor)).toBe(true);
    });
  });

  describe('canMergeDown', () => {
    it('is false in the last row', () => {
      const input = (
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
      expect(canMergeDown(editor)).toBe(false);

      const before = editor.children;
      mergeCellDown(editor);
      expect(editor.children).toBe(before);
    });

    it('is false from a header-row cell when the header is enabled', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>
                  A<cursor />
                </hp>
              </hth>
              <hth>
                <hp>B</hp>
              </hth>
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

      const { editor } = createTestEditor({ input });
      expect(canMergeDown(editor)).toBe(false);
      expect(canMergeRight(editor)).toBe(true);
    });

    it('is false when the cell below has a different colspan', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  A<cursor />
                </hp>
              </htd>
              <htd>
                <hp>B</hp>
              </htd>
            </htr>
            <htr>
              <htd data={{ colspan: 2 }}>
                <hp>C</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      expect(canMergeDown(editor)).toBe(false);
    });

    it('is false when the cell below has the same colspan but a different origin column', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>P</hp>
              </htd>
              <htd data={{ colspan: 2 }}>
                <hp>
                  Q<cursor />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd data={{ colspan: 2 }}>
                <hp>N</hp>
              </htd>
              <htd>
                <hp>R</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      // Valid content: normalization leaves it unchanged
      assertOutput({ input, expected: input });

      const { editor } = createTestEditor({ input });
      expect(canMergeDown(editor)).toBe(false);
    });

    it('is true for a cell below with the same left column and colspan', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  A<cursor />
                </hp>
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

      const { editor } = createTestEditor({ input });
      expect(canMergeDown(editor)).toBe(true);
    });
  });

  it('canMergeRight and canMergeDown are false outside a table', () => {
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
        <hp>
          outside
          <cursor />
        </hp>
      </editor>
    );

    const { editor } = createTestEditor({ input });
    expect(canMergeRight(editor)).toBe(false);
    expect(canMergeDown(editor)).toBe(false);

    const before = editor.children;
    mergeCellRight(editor);
    mergeCellDown(editor);
    expect(editor.children).toBe(before);
  });

  it('undo restores the original table', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
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
            <htd>
              <hp>D</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    const original = editor.children;
    mergeCellRight(editor);
    expect(editor.children).not.toEqual(original);

    editor.undo();

    expect(editor.children).toEqual(original);
  });

  it('Tab visits every cell in a merged table', () => {
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

    const { editor } = createTestEditor({ input });
    const visited: number[][] = [];
    for (let i = 0; i < 3; i++) {
      fireTab(editor);
      visited.push(editor.selection!.anchor.path.slice(0, 3));
    }

    expect(visited[0]).toEqual([0, 1, 0]);
    expect(visited[1]).toEqual([0, 1, 1]);
    // Tab from the last cell adds a row below and moves into it
    expect(visited[2][0]).toBe(0);
    expect(visited[2][1]).toBe(2);
    expect(new Set(visited.map((p) => p.join())).size).toBe(3);
  });

  it('Tab visits every cell in a rowspan layout', () => {
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
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>Y</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    const visited: number[][] = [];
    // Two Tabs: a third from the last cell would add a row below
    for (let i = 0; i < 2; i++) {
      fireTab(editor);
      visited.push(editor.selection!.anchor.path.slice(0, 3));
    }

    expect(visited).toEqual([
      [0, 0, 1],
      [0, 1, 0],
    ]);
  });
});
