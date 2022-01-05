/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  it('removes empty links from the document structure', () => {
    const input = (
      <editor>
        <hp>
          <htext>link</htext>
          <hlink uri="https://link.com" />
        </hp>
        <hp>
          <htext>asset</htext>
          <hlink asset="asset-id" />
        </hp>
        <hp>
          <htext>entry</htext>
          <hlink entry="entry-id" />
        </hp>
      </editor>
    );

    const expected = (
      <editor>
        <hp>
          <htext>link</htext>
        </hp>
        <hp>
          <htext>asset</htext>
        </hp>
        <hp>
          <htext>entry</htext>
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});
