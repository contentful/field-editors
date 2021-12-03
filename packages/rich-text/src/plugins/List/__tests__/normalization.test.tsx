/** @jsx jsx */
import { Editor } from 'slate';

import { jsx, createTestEditor } from '../../../test-utils';

describe('List normalizers', () => {
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

  it('wraps orphaned list items in a list', () => {
    const input = (
      <editor>
        <hli>
          <hp>Item</hp>
          <cursor />
        </hli>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>
          </hli>
        </hul>
        <hp />
      </editor>
    );

    assertOutput(input, expected);
  });

  it('replaces invalid list items with text', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>bold text</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    Take a look at this <hlink uri="https://google.com">link</hlink>
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </hli>
        </hul>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>
            <hp>
              <htext bold>bold text</htext>
            </hp>
            <hp>
              Take a look at this <hlink uri="https://google.com">link</hlink>
              <htext />
            </hp>
          </hli>
        </hul>
        <hp />
      </editor>
    );

    assertOutput(input, expected);
  });
});
