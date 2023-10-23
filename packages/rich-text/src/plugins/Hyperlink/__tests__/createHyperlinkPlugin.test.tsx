/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { assertOutput, jsx } from '../../../test-utils';

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
        <hp>
          <htext>resource</htext>
          <hlink resource="resource-urn" />
        </hp>
        <hp>
          <htext>explicit empty link</htext>
          <hlink uri="https://link.com">{''}</hlink>
        </hp>
        <hp>
          <htext>link with empty space</htext>
          <hlink uri="https://link.com"> </hlink>
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
        <hp>
          <htext>resource</htext>
        </hp>
        <hp>
          <htext>explicit empty link</htext>
        </hp>
        <hp>
          <htext>link with empty space</htext>
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});
