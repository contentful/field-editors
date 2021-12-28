/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  it('lifts invalid children', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>hello</hp>
          <hembed type="Asset" id="asset-id" />
          <hp>world</hp>
        </hblockquote>
      </editor>
    );

    const expected = (
      <editor>
        <hblockquote>
          <hp>hello</hp>
        </hblockquote>

        <hembed type="Asset" id="asset-id" />

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
