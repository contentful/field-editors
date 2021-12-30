/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  it('wraps orphaned list items in a list', () => {
    const input = (
      <editor>
        <hli>
          <hp>Item</hp>
        </hli>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  it('adds empty paragraph to empty list items', () => {
    const input = (
      <editor>
        <hul>
          <hli />
        </hul>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>
              <htext />
            </hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  it('replaces invalid list items with text', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>

            <htd>
              <hp>
                <htext bold>bold text</htext>
              </hp>
            </htd>

            <htd>
              <hp>
                Take a look at this <hlink uri="https://google.com">link</hlink>
              </hp>
            </htd>
          </hli>
        </hul>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>

            <hp>
              <htext bold>bold text</htext>
            </hp>

            <hp>
              Take a look at this <hlink uri="https://google.com">link</hlink>
              <htext />
            </hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});
