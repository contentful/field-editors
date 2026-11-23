/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { PlateEditor } from '../../../internal/plate';
import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { addColumnLeft, addColumnRight, addRowAbove, addRowBelow } from '../actions';
import { createTablePlugin } from '../createTablePlugin';

const empty = (
  <hp>
    <htext />
  </hp>
);

const emptyWithCursor = (
  <hp>
    <cursor />
  </hp>
);

const fireTab = (editor: PlateEditor) => {
  const tablePlugin = createTablePlugin();
  const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
  tablePlugin.handlers!.onKeyDown!(editor as any, tablePlugin as any)(event as any);
  return event;
};

describe('adding rows and columns around merged cells', () => {
  describe('add row', () => {
    it('add row below through a rowspan', () => {
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
              <htd data={{ rowspan: 3 }}>
                <hp>A</hp>
              </htd>
              <htd>
                <hp>B</hp>
              </htd>
            </htr>
            <htr>
              <htd>{emptyWithCursor}</htd>
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
      addRowBelow(editor);
      assertOutput({ editor, expected });
    });

    it("add row below a rowspan's last row does not extend it", () => {
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
            <htr>
              <htd>{emptyWithCursor}</htd>
              <htd>{empty}</htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      addRowBelow(editor);
      assertOutput({ editor, expected });
    });

    it('add row below a rowspan cell uses its bottom edge', () => {
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
            <htr>
              <htd>{emptyWithCursor}</htd>
              <htd>{empty}</htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      addRowBelow(editor);
      assertOutput({ editor, expected });
    });

    it('add row above through a rowspan', () => {
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
              <htd data={{ rowspan: 3 }}>
                <hp>A</hp>
              </htd>
              <htd>
                <hp>B</hp>
              </htd>
            </htr>
            <htr>
              <htd>{emptyWithCursor}</htd>
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
      addRowAbove(editor);
      assertOutput({ editor, expected });
    });

    it('Tab past the last cell adds a full-width row under a colspan', () => {
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
              <htd data={{ colspan: 2 }}>
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
                <hp>B</hp>
              </htd>
            </htr>
            <htr>
              <htd data={{ colspan: 2 }}>
                <hp>C</hp>
              </htd>
            </htr>
            <htr>
              <htd>{emptyWithCursor}</htd>
              <htd>{empty}</htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      const event = fireTab(editor);
      expect(event.defaultPrevented).toBe(true);
      assertOutput({ editor, expected });
    });
  });

  describe('add column', () => {
    it('add column right through a colspan', () => {
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
              <htd data={{ colspan: 3 }}>
                <hp>A</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>B</hp>
              </htd>
              <htd>{emptyWithCursor}</htd>
              <htd>
                <hp>C</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      addColumnRight(editor, { header: false });
      assertOutput({ editor, expected });
    });

    it('add column left at the edge of a colspan does not extend it', () => {
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
              <htd>{emptyWithCursor}</htd>
              <htd data={{ colspan: 2 }}>
                <hp>A</hp>
              </htd>
            </htr>
            <htr>
              <htd>{empty}</htd>
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
      addColumnLeft(editor, { header: false });
      assertOutput({ editor, expected });
    });

    it('add column right of a rowspan cell skips the rows it covers only once', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>A</hp>
              </htd>
              <htd data={{ rowspan: 2 }}>
                <hp>
                  B<cursor />
                </hp>
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
                <hp>A</hp>
              </htd>
              <htd data={{ rowspan: 2 }}>
                <hp>B</hp>
              </htd>
              <htd>{emptyWithCursor}</htd>
            </htr>
            <htr>
              <htd>
                <hp>C</hp>
              </htd>
              <htd>{empty}</htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      addColumnRight(editor, { header: false });
      assertOutput({ editor, expected });
    });

    it('add column right through a cell spanning two rows and columns extends it once', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd data={{ colspan: 2, rowspan: 2 }}>
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
            <htr>
              <htd>
                <hp>
                  D<cursor />
                </hp>
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
              <htd data={{ colspan: 3, rowspan: 2 }}>
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
            <htr>
              <htd>
                <hp>D</hp>
              </htd>
              <htd>{emptyWithCursor}</htd>
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
      addColumnRight(editor, { header: false });
      assertOutput({ editor, expected });
    });

    it('add column with header enabled', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>H1</hp>
              </hth>
              <hth>
                <hp>H2</hp>
              </hth>
            </htr>
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
              <hth>
                <hp>H1</hp>
              </hth>
              <hth>{emptyWithCursor}</hth>
              <hth>
                <hp>H2</hp>
              </hth>
            </htr>
            <htr>
              <htd data={{ colspan: 3 }}>
                <hp>A</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>B</hp>
              </htd>
              <htd>{empty}</htd>
              <htd>
                <hp>C</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      addColumnRight(editor, { header: true });
      assertOutput({ editor, expected });
    });

    it('add column with header enabled does not create a header cell under a header colspan', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <hth data={{ colspan: 2 }}>
                <hp>H</hp>
              </hth>
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
              <hth data={{ colspan: 3 }}>
                <hp>H</hp>
              </hth>
            </htr>
            <htr>
              <htd>
                <hp>B</hp>
              </htd>
              <htd>{emptyWithCursor}</htd>
              <htd>
                <hp>C</hp>
              </htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      addColumnRight(editor, { header: true });
      assertOutput({ editor, expected });
    });
  });

  describe('span-free tables', () => {
    it('add row below and column right behave as before', () => {
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
              <htd>
                <hp>A</hp>
              </htd>
              <htd>{emptyWithCursor}</htd>
              <htd>
                <hp>B</hp>
              </htd>
            </htr>
            <htr>
              <htd>{empty}</htd>
              <htd>{empty}</htd>
              <htd>{empty}</htd>
            </htr>
          </htable>
          {empty}
        </editor>
      );

      const { editor } = createTestEditor({ input });
      addRowBelow(editor);
      // Back to A, then add a column to its right
      editor.tf.select({ path: [0, 0, 0, 0, 0], offset: 1 });
      addColumnRight(editor, { header: false });
      assertOutput({ editor, expected });
    });
  });
});
