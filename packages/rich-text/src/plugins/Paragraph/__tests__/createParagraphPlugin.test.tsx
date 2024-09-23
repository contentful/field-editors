/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { assertOutput, jsx } from '../../../test-utils';

describe('normalization', () => {
  it('can contain inline entries & hyperlinks', () => {
    const input = (
      <editor>
        <hp>
          some text before
          <hinline type="Entry" id="inline-entry" />
          <hlink uri="https://contentful.com" />
          <hlink entry="entry-id" />
          <hlink resource="resource-urn" />
          <hlink asset="asset-id" />
          some text after
        </hp>
      </editor>
    );

    assertOutput({ input, expected: input });
  });

  it('wraps orphaned text nodes in a paragraph', () => {
    const input = (
      <editor>
        <hp>valid text</hp>
        <hh1>valid text</hh1>

        <htable>
          <htr>
            <htd>invalid text</htd>
          </htr>
        </htable>
      </editor>
    );

    const expected = (
      <editor>
        <hp>valid text</hp>
        <hh1>valid text</hh1>

        <htable>
          <htr>
            <htd>
              <hp>invalid text</hp>
            </htd>
          </htr>
        </htable>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  it('unwraps nested paragraphs', () => {
    const input = (
      <editor>
        <hp>
          some
          <hp>
            <htext bold italic underline>
              paragraph
            </htext>
          </hp>
          text
        </hp>
      </editor>
    );

    const expected = (
      <editor>
        <hp>
          some
          <htext bold italic underline>
            paragraph
          </htext>
          text
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
          <hp>
            <hembed type="Asset" id="1" /> start
          </hp>

          <hp>
            end <hembed type="Asset" id="2" />
          </hp>

          <hp>
            in <hembed type="Asset" id="3" /> between
          </hp>

          {/* Entry block */}
          <hp>
            <hembed type="Entry" id="1" /> start
          </hp>

          <hp>
            end <hembed type="Entry" id="2" />
          </hp>

          <hp>
            in <hembed type="Entry" id="3" /> between
          </hp>

          {/* HR*/}
          <hp>
            <hhr /> start
          </hp>

          <hp>
            end <hhr />
          </hp>

          <hp>
            in <hhr /> between
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          {/* Asset block */}
          <hembed type="Asset" id="1" />
          <hp> start</hp>

          <hp>end </hp>
          <hembed type="Asset" id="2" />

          <hp>in </hp>
          <hembed type="Asset" id="3" />
          <hp> between</hp>

          {/* Entry block */}
          <hembed type="Entry" id="1" />
          <hp> start</hp>

          <hp>end </hp>
          <hembed type="Entry" id="2" />

          <hp>in </hp>
          <hembed type="Entry" id="3" />
          <hp> between</hp>

          {/* HR*/}
          <hhr />
          <hp> start</hp>

          <hp>end </hp>
          <hhr />

          <hp>in </hp>
          <hhr />
          <hp> between</hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles heading', () => {
      const input = (
        <editor>
          <hp>
            some
            <hh1>heading</hh1>
            text
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <hp>some</hp>

          <hh1>heading</hh1>

          <hp>text</hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles quotes', () => {
      const input = (
        <editor>
          <hp>
            some
            <hquote>
              <hp>quote</hp>
            </hquote>
            text
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <hp>some</hp>

          <hquote>
            <hp>quote</hp>
          </hquote>

          <hp>text</hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles lists', () => {
      const input = (
        <editor>
          <hp>
            some
            <hul>
              <hli>
                <hp>list item</hp>
              </hli>
            </hul>
            text
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <hp>some</hp>

          <hul>
            <hli>
              <hp>list item</hp>
            </hli>
          </hul>

          <hp>text</hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles tables', () => {
      const input = (
        <editor>
          <hp>
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
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <hp>some</hp>

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

          <hp>text</hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });
});
