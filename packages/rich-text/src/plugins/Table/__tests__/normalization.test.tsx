/** @jsx jsx */
import { Editor } from 'slate';

import { jsx, createTestEditor } from '../../../test-utils';

describe('Table normalizers', () => {
  const assertOutput = (input: any, expected: any) => {
    const editor = createTestEditor({
      input,
    });

    // A hack to force normalization since calling
    // editor.normalizeNode([input, []]) doesn't work
    Editor.withoutNormalizing(editor, () => {
      editor.insertText('X');
      editor.deleteBackward('character');
    });

    expect(editor.children).toEqual(expected.children);
  };

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
          <htd>
            invalid cell <cursor />
          </htd>
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
        <hp />
      </editor>
    );

    assertOutput(input, expected);
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
                </hp>
                <cursor />
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
              </hp>
            </htd>
          </htr>
        </htable>
        <hp />
      </editor>
    );

    assertOutput(input, expected);
  });
});
