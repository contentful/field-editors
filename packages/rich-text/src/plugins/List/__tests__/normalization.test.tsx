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
          <hp>
            Item
            <cursor />
          </hp>
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

  it('adds empty paragraph to empty list items', () => {
    const input = (
      <editor>
        <hul>
          <hli />
        </hul>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>
              <text />
            </hp>
          </hli>
        </hul>
        <hp />
      </editor>
    );

    const editor = createTestEditor({
      input,
    });

    const entry: any = [
      editor.children[0].children[0], // node
      [0, 0], // path
    ];

    editor.normalizeNode(entry);

    // @ts-expect-error
    expect(editor.children).toEqual(expected.children);
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
