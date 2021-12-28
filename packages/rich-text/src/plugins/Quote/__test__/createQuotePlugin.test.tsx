/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  it('lifts invalid children', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>hello</hp>
          <hassetBlock id="asset-id" />
          <hp>world</hp>
        </hblockquote>
      </editor>
    );

    const expected = (
      <editor>
        <hblockquote>
          <hp>hello</hp>
        </hblockquote>

        <hassetBlock id="asset-id" />

        <hblockquote>
          <hp>world</hp>
        </hblockquote>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});
