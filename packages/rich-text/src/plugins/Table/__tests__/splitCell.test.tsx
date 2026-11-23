/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { canSplitCell, splitCell } from '../actions';

const empty = (
  <hp>
    <htext />
  </hp>
);

describe('splitting table cells', () => {
  it('splits a colspan cell', () => {
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
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{}}>
              <hp>
                A<cursor />
              </hp>
            </htd>
            <htd data={{}}>{empty}</htd>
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
    expect(canSplitCell(editor)).toBe(true);
    splitCell(editor);
    assertOutput({ editor, expected });
  });

  it('splits a rowspan cell', () => {
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
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{}}>
              <hp>
                A<cursor />
              </hp>
            </htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd data={{}}>{empty}</htd>
            <htd>
              <hp>Y</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    splitCell(editor);
    assertOutput({ editor, expected });
  });

  it('splits a 2x2 block', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 2, rowspan: 2 }}>
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
    const expected = (
      <editor>
        <htable>
          <htr>
            <htd data={{}}>
              <hp>
                A<cursor />
              </hp>
            </htd>
            <htd data={{}}>{empty}</htd>
            <htd>
              <hp>X</hp>
            </htd>
          </htr>
          <htr>
            <htd data={{}}>{empty}</htd>
            <htd data={{}}>{empty}</htd>
            <htd>
              <hp>Y</hp>
            </htd>
          </htr>
        </htable>
        {empty}
      </editor>
    );

    const { editor } = createTestEditor({ input });
    splitCell(editor);
    assertOutput({ editor, expected });
  });

  it('uses header cells in the header row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <hth data={{ colspan: 2 }}>
              <hp>
                A<cursor />
              </hp>
            </hth>
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
            <hth data={{}}>
              <hp>
                A<cursor />
              </hp>
            </hth>
            <hth data={{}}>{empty}</hth>
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
    splitCell(editor);
    assertOutput({ editor, expected });
  });

  it('canSplitCell is false on a 1x1 cell and split is a no-op', () => {
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
        </htable>
        {empty}
      </editor>
    );
    const { editor } = createTestEditor({ input });
    expect(canSplitCell(editor)).toBe(false);
    const before = editor.children;
    splitCell(editor);
    expect(editor.children).toBe(before);
  });

  it('undo restores the merged cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd data={{ colspan: 2, rowspan: 2 }}>
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
    const original = editor.children;
    splitCell(editor);
    expect(editor.children).not.toEqual(original);

    editor.undo();

    expect(editor.children).toEqual(original);
  });
});
