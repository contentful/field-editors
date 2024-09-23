/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { assertOutput, jsx } from '../../../test-utils';

describe('normalization', () => {
  it('can contain inline entries & hyperlinks', () => {
    const input = (
      <editor>
        <hquote>
          <hp>
            some text before
            <hinline type="Entry" id="inline-entry" />
            <hlink uri="https://contentful.com" />
            <hlink entry="entry-id" />
            <hlink resource="resource-urn" />
            <hlink asset="asset-id" />
            some text after
          </hp>
        </hquote>
      </editor>
    );

    assertOutput({ input, expected: input });
  });

  it('unwraps nested quotes', () => {
    const input = (
      <editor>
        <hquote>
          <hp>some</hp>
          <hquote>
            <hp>
              <htext bold italic underline>
                paragraph
              </htext>
            </hp>
          </hquote>
          <hp>text</hp>
        </hquote>
      </editor>
    );

    const expected = (
      <editor>
        <hquote>
          <hp>some</hp>

          <hp>
            <htext bold italic underline>
              paragraph
            </htext>
          </hp>

          <hp>text</hp>
        </hquote>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  describe('lifts other invalid children', () => {
    it('block void elements', () => {
      const input = (
        <editor>
          <hquote>
            <hp>this</hp>
            <hembed type="Asset" id="1" />

            <hp>is</hp>
            <hembed type="Entry" id="1" />

            <hp>a blockquote</hp>
            <hhr />
            <hh1>Heading 1</hh1>
          </hquote>
        </editor>
      );

      const expected = (
        <editor>
          <hquote>
            <hp>this</hp>
          </hquote>
          <hembed type="Asset" id="1" />

          <hquote>
            <hp>is</hp>
          </hquote>
          <hembed type="Entry" id="1" />

          <hquote>
            <hp>a blockquote</hp>
          </hquote>
          <hhr />

          <hh1>Heading 1</hh1>

          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles lists', () => {
      const input = (
        <editor>
          <hquote>
            <hp>
              some
              <hul>
                <hli>
                  <hp>list item</hp>
                </hli>
              </hul>
              text
            </hp>
          </hquote>
        </editor>
      );

      const expected = (
        <editor>
          <hquote>
            <hp>some</hp>
          </hquote>

          <hul>
            <hli>
              <hp>list item</hp>
            </hli>
          </hul>

          <hquote>
            <hp>text</hp>
          </hquote>
          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles tables', () => {
      const table = (
        <htable>
          <htr>
            <htd>
              <hp>cell 1</hp>
            </htd>
            <htd>
              <hp>cell 2</hp>
            </htd>
          </htr>
        </htable>
      );

      const input = (
        <editor>
          <hquote>
            <hp>
              some
              {table}
              text
            </hp>
          </hquote>
        </editor>
      );

      const expected = (
        <editor>
          <hquote>
            <hp>some</hp>
          </hquote>

          {table}

          <hquote>
            <hp>text</hp>
          </hquote>
          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });
});
