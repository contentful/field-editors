/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  it('lifts invalid children', () => {
    const input = (
      <editor>
        <hquote>
          <hp>hello</hp>
          <hembed type="Asset" id="asset-id" />
          <hp>world</hp>
        </hquote>
      </editor>
    );

    const expected = (
      <editor>
        <hquote>
          <hp>hello</hp>
        </hquote>

        <hembed type="Asset" id="asset-id" />

        <hquote>
          <hp>world</hp>
        </hquote>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});
