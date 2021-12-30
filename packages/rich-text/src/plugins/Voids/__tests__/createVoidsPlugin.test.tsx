/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  it('can only contain empty text', () => {
    const invalidChildren = (
      <hfragment>
        <hp>invalid text</hp>

        <hh1>invalid heading</hh1>

        <hquote>
          <hp>invalid quote</hp>
        </hquote>

        <hul>
          <hli>
            <hp>invalid list item</hp>
          </hli>
        </hul>
      </hfragment>
    );

    const input = (
      <editor>
        <hhr>{invalidChildren}</hhr>

        <hp>
          <hinline type="Entry" id="inline">
            {invalidChildren}
          </hinline>
        </hp>

        <hembed type="Entry" id="entry">
          {invalidChildren}
        </hembed>

        <hembed type="Asset" id="asset">
          {invalidChildren}
        </hembed>
      </editor>
    );

    const expected = (
      <editor>
        <hhr />

        <hp>
          <htext />
          <hinline type="Entry" id="inline" />
          <htext />
        </hp>

        <hembed type="Entry" id="entry" />

        <hembed type="Asset" id="asset" />

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});
