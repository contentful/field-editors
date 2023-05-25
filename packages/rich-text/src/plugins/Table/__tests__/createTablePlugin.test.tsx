/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { assertOutput, jsx } from '../../../test-utils';

describe('normalization', () => {
  describe('Table', () => {
    it('removes empty table nodes', () => {
      const input = (
        <editor>
          <htable />
        </editor>
      );

      const expected = (
        <editor>
          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

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

    it('removes invalid children', () => {
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

  describe('Table row', () => {
    it('must be wrapped in a table', () => {
      const input = (
        <editor>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell</hp>
              </htd>
            </htr>
          </htable>

          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('removes empty rows', () => {
      const input = (
        <editor>
          <htr />
        </editor>
      );

      const expected = (
        <editor>
          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('wraps invalid children in table cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
              <hp>cell 2</hp>
            </htr>
          </htable>
        </editor>
      );

      const expected = (
        <editor>
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

          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('ensures all table rows have the same width', () => {
      const input = (
        <editor>
          <htable>
            {/* 1 column */}
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
            </htr>

            {/* 3 columns */}
            <htr>
              <htd>
                <hp>cell 2</hp>
              </htd>
              <htd>
                <hp>cell 3</hp>
              </htd>
              <htd>
                <hp>cell 4</hp>
              </htd>
            </htr>

            {/* 2 columns */}
            <htr>
              <htd>
                <hp>cell 5</hp>
              </htd>
              <htd>
                <hp>cell 6</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
              <htd>
                <hp>
                  <text />
                </hp>
              </htd>
              <htd>
                <hp>
                  <text />
                </hp>
              </htd>
            </htr>

            <htr>
              <htd>
                <hp>cell 2</hp>
              </htd>
              <htd>
                <hp>cell 3</hp>
              </htd>
              <htd>
                <hp>cell 4</hp>
              </htd>
            </htr>

            <htr>
              <htd>
                <hp>cell 5</hp>
              </htd>
              <htd>
                <hp>cell 6</hp>
              </htd>
              <htd>
                <hp>
                  <text />
                </hp>
              </htd>
            </htr>
          </htable>

          <hp>
            <text />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });
});
