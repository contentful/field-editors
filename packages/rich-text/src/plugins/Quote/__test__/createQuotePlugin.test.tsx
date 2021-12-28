/** @jsx jsx */
import { jsx, expectNormalized } from '../../../test-utils';

describe('normalization', () => {
  it('lifts invalid children', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>hello</hp>
          <hassetblock id="asset-id" />
          <hp>world</hp>
        </hblockquote>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hblockquote>
          <hp>hello</hp>
        </hblockquote>

        <hassetblock id="asset-id" />

        <hblockquote>
          <hp>world</hp>
        </hblockquote>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    expectNormalized(input, expected);
  });
});
