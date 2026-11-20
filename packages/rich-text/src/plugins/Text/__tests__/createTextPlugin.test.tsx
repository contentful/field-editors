/** @jsx jsx */

import { describe, expect, test } from 'vitest';

import { jsx, assertOutput, createTestEditor } from '../../../test-utils';

describe('delete backward', () => {
  test('removes an empty heading after a table while keeping the table', () => {
    const { editor } = createTestEditor({});
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'cell' }] }],
              },
            ],
          },
        ],
      },
      { type: 'heading-1', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ];
    editor.tf.select({ path: [1, 0], offset: 0 });

    editor.deleteBackward('character');

    expect(editor.children[0].type).toBe('table');
    expect(editor.children.some((node) => node.type === 'heading-1')).toBe(false);
    expect(editor.selection?.anchor.path).toEqual([1, 0]);
  });

  const tests = [
    {
      title: 'deletes a character of the text inside li',
      input: (
        <hul>
          <hli>
            <hp>
              p1
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>
              p<cursor />
            </hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'does not delete the very first paragraph',
      input: (
        <fragment>
          <hp>
            <cursor />
          </hp>
          <hp>text</hp>
        </fragment>
      ),
      expected: (
        <fragment>
          <hp>
            <cursor />
          </hp>
          <hp>text</hp>
        </fragment>
      ),
    },
  ];

  const render = (children: any) => (
    <editor>
      {children}
      <hp>
        <htext />
      </hp>
    </editor>
  );

  for (const t of tests) {
    test(t.title, () => {
      const { editor } = createTestEditor({
        input: render(t.input),
      });

      // Equivalent of pressing backspace
      editor.deleteBackward('character');

      assertOutput({
        editor,
        expected: render(t.expected),
      });
    });
  }
});

describe('delete forward', () => {
  const tests = [
    {
      title: 'deletes a character of the text inside li',
      input: (
        <hul>
          <hli>
            <hp>
              <cursor />
              p1
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>
              <cursor />1
            </hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'deletes the first paragraph when followed by another paragraph',
      input: (
        <fragment>
          <hp>
            <cursor />
          </hp>
          <hp>text</hp>
        </fragment>
      ),
      expected: (
        <hp>
          <cursor />
          text
        </hp>
      ),
    },
    {
      title: 'deletes the first paragraph when followed by li',
      input: (
        <fragment>
          <hp>
            <cursor />
          </hp>
          <hul>
            <hli>
              <hp>p1</hp>
            </hli>
          </hul>
        </fragment>
      ),
      expected: (
        <hul>
          <hli>
            <hp>
              <cursor />
              p1
            </hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'deletes the first paragraph when followed by a blockquote',
      input: (
        <fragment>
          <hp>
            <cursor />
          </hp>
          <hquote>
            <hp>p1</hp>
          </hquote>
        </fragment>
      ),
      expected: (
        <hquote>
          <hp>
            <cursor />
            p1
          </hp>
        </hquote>
      ),
    },
    {
      title: 'deletes the empty paragraph after a table with Delete',
      input: (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>cell</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <cursor />
          </hp>
        </fragment>
      ),
      expected: (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>cell</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ),
    },
  ];

  const render = (children: any) => (
    <editor>
      {children}
      <hp>
        <htext />
      </hp>
    </editor>
  );

  for (const t of tests) {
    test(t.title, () => {
      const { editor } = createTestEditor({
        input: render(t.input),
      });

      // Equivalent of pressing backspace
      editor.deleteForward('character');

      assertOutput({
        editor,
        expected: render(t.expected),
      });
    });
  }
});
