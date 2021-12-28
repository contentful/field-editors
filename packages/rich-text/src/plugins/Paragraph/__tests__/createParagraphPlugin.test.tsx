/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  it('wraps orphaned text nodes in a paragraph', () => {
    const input = (
      <editor>
        <hp>valid text</hp>
        <hh1>valid text</hh1>
        <hinlineEntry id="entry-id" />

        <htable>
          <htr>
            <htd>invalid text</htd>
          </htr>
        </htable>
      </editor>
    );

    const expected = (
      <editor>
        <hp>valid text</hp>
        <hh1>valid text</hh1>
        <hinlineEntry id="entry-id" />

        <htable>
          <htr>
            <htd>
              <hp>invalid text</hp>
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
