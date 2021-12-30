/** @jsx jsx */
import { jsx, assertOutput } from '../../../test-utils';

describe('normalization', () => {
  describe('Table', () => {
    it('moves tables to the root level except nested tables', () => {
      const table = (
        <htable>
          <htr>
            <htd>
              <hp>Cell 1</hp>
            </htd>
            <htd>
              <hp>Cell 2</hp>
            </htd>
          </htr>
        </htable>
      );

      const input = (
        <editor>
          {/* Inside Paragraphs */}
          <hp>
            hello
            {table}
          </hp>

          {/* Inside quotes */}
          <hquote>
            <hp>
              quote
              {table}
            </hp>
          </hquote>

          {/* Inside lists */}
          <hul>
            <hli>
              <hp>
                item
                {table}
              </hp>
            </hli>
          </hul>

          {/* Nested tables */}
          <htable>
            <htr>
              <htd>
                <hp>cell with table: {table}</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      );

      const expected = (
        <editor>
          <hp>hello</hp>

          {table}

          <hquote>
            <hp>quote</hp>
          </hquote>

          {table}

          <hul>
            <hli>
              <hp>item</hp>
            </hli>
          </hul>

          {table}

          <htable>
            <htr>
              <htd>
                <hp>cell with table: </hp>
                <hp>Cell 1</hp>
                <hp>Cell 2</hp>
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

    it('removes nodes not wrapped in table-row', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
              </htd>
            </htr>
            <htd>invalid cell</htd>
            invalid text
          </htable>
          <hp />
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
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
  });

  describe('Table cell', () => {
    it('converts invalid children to paragraphs', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
                <hquote>
                  <hp>
                    <htext bold italic underline>
                      quote
                    </htext>
                    <hinline type="Entry" id="entry-id" />
                  </hp>
                </hquote>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>Cell 1</hp>
              </htd>
              <htd>
                <hp>Cell 2</hp>
                <hp>
                  <htext bold italic underline>
                    quote
                  </htext>
                  <hinline type="Entry" id="entry-id" />
                  <htext />
                </hp>
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
  });
});
