/** @jsx jsx */
import { jsx, assertOutput, createTestEditor } from '../../../test-utils';
import { insertTableAndFocusFirstCell } from '../helpers';

test('insertTableAndFocusFirstCell', () => {
  const input = (
    <editor>
      <hp>
        <htext />
        <cursor />
      </hp>
      <hp />
    </editor>
  );

  const { editor } = createTestEditor({
    input,
  });

  insertTableAndFocusFirstCell(editor);

  const expected = (
    <editor>
      <htable>
        <htr>
          <hth>
            <hp>
              <htext />
              {/* Notice the cursor position */}
              <cursor />
            </hp>
          </hth>
          <hth>
            <hp>
              <htext />
            </hp>
          </hth>
        </htr>
        <htr>
          <htd>
            <hp>
              <htext />
            </hp>
          </htd>
          <htd>
            <hp>
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
