/** @jsx jsx */
import { jsx, expectNormalized } from '../../../test-utils';

describe('Table normalizers', () => {
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

    expectNormalized({ input, expected });
  });

  it('converts invalid table-cell children to paragraphs', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>Cell 1</hp>
            </htd>
            <htd>
              <hp>Cell 2</hp>
              <hblockquote>
                <hp>
                  <htext bold italic underline>
                    quote
                  </htext>
                  <hinlineEntry id="entry-id" />
                </hp>
              </hblockquote>
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
                <hinlineEntry id="entry-id" />
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

    expectNormalized({ input, expected });
  });
});
