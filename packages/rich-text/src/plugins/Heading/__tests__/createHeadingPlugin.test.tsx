/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { assertOutput, jsx } from '../../../test-utils';

describe('normalization', () => {
  it('can contain inline entries & hyperlinks', () => {
    const input = (
      <editor>
        <hh1>
          some text before
          <hinline type="Entry" id="inline-entry" />
          <hlink uri="https://contentful.com" />
          <hlink entry="entry-id" />
          <hlink resource="resource-urn" />
          <hlink asset="asset-id" />
          some text after
        </hh1>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected: input });
  });

  it('unwraps nested paragraphs', () => {
    const input = (
      <editor>
        <hh1>
          one{' '}
          <hp>
            two <hp>three </hp>
          </hp>
          four
        </hh1>
      </editor>
    );

    const expected = (
      <editor>
        <hh1>one two three four</hh1>

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
          {/* Asset block */}
          <hh1>
            <hembed type="Asset" id="1" /> start
          </hh1>

          <hh1>
            end <hembed type="Asset" id="2" />
          </hh1>

          <hh1>
            in <hembed type="Asset" id="3" /> between
          </hh1>

          {/* Entry block */}
          <hh1>
            <hembed type="Entry" id="1" /> start
          </hh1>

          <hh1>
            end <hembed type="Entry" id="2" />
          </hh1>

          <hh1>
            in <hembed type="Entry" id="3" /> between
          </hh1>

          {/* HR*/}
          <hh1>
            <hhr /> start
          </hh1>

          <hh1>
            end <hhr />
          </hh1>

          <hh1>
            in <hhr /> between
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          {/* Asset block */}
          <hembed type="Asset" id="1" />
          <hh1> start</hh1>

          <hh1>end </hh1>
          <hembed type="Asset" id="2" />

          <hh1>in </hh1>
          <hembed type="Asset" id="3" />
          <hh1> between</hh1>

          {/* Entry block */}
          <hembed type="Entry" id="1" />
          <hh1> start</hh1>

          <hh1>end </hh1>
          <hembed type="Entry" id="2" />

          <hh1>in </hh1>
          <hembed type="Entry" id="3" />
          <hh1> between</hh1>

          {/* HR*/}
          <hhr />
          <hh1> start</hh1>

          <hh1>end </hh1>
          <hhr />

          <hh1>in </hh1>
          <hhr />
          <hh1> between</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('nested headings', () => {
      const input = (
        <editor>
          <hh1>
            some
            <hh1>
              <htext bold italic underline>
                paragraph
              </htext>
            </hh1>
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

          <hh1>
            <htext bold italic underline>
              paragraph
            </htext>
          </hh1>

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles quotes', () => {
      const input = (
        <editor>
          <hh1>
            some
            <hquote>
              <hp>quote</hp>
            </hquote>
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

          <hquote>
            <hp>quote</hp>
          </hquote>

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles lists', () => {
      const input = (
        <editor>
          <hh1>
            some
            <hul>
              <hli>
                <hp>list item</hp>
              </hli>
            </hul>
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

          <hul>
            <hli>
              <hp>list item</hp>
            </hli>
          </hul>

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles tables', () => {
      const input = (
        <editor>
          <hh1>
            some
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
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

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

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });
});
