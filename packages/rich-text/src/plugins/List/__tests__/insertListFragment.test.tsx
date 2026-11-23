/** @jsx jsx */
import { BLOCKS } from '@contentful/rich-text-types';
import { describe, expect, test } from 'vitest';

import { jsx, assertOutput, createTestEditor } from '../../../test-utils';

type AnyNode = { type?: string; text?: string; children?: AnyNode[] };

const findLists = (nodes: AnyNode[], type: string): AnyNode[] =>
  nodes.flatMap((node) => [
    ...(node.type === type ? [node] : []),
    ...findLists(node.children ?? [], type),
  ]);

const textOf = (node: AnyNode): string =>
  node.text !== undefined ? node.text : (node.children ?? []).map(textOf).join('');

// Text of each list item in the first list of the given type found in the tree.
const pastedItemsOf = (nodes: AnyNode[], type: string) => {
  const [list] = findLists(nodes, type);
  return (list?.children ?? []).map((item) => textOf(item).trim());
};

describe('insert fragment', () => {
  const tests = [
    {
      title: 'text wrapped in li > p',
      input: (
        <hul>
          <hli>
            <hp>
              hello <cursor />
            </hp>
          </hli>
        </hul>
      ),
      fragment: (
        <fragment>
          <hli>
            <hp>world</hp>
          </hli>
        </fragment>
      ),
      expected: (
        <hul>
          <hli>
            <hp>hello world</hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'text wrapped in li > h*',
      input: (
        <hul>
          <hli>
            <hp>
              hello <cursor />
            </hp>
          </hli>
        </hul>
      ),
      fragment: (
        <fragment>
          <hli>
            <hh1>world</hh1>
          </hli>
        </fragment>
      ),
      expected: (
        <hul>
          <hli>
            <hp>hello world</hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'single li with only asset card',
      input: (
        <hul>
          <hli>
            <hp>
              hello
              <cursor />
              world
            </hp>
          </hli>
        </hul>
      ),
      fragment: (
        <fragment>
          <hli>
            <hembed type="Asset" id="asset-id" />
          </hli>
        </fragment>
      ),
      expected: (
        <hul>
          <hli>
            <hp>hello</hp>
            <hembed type="Asset" id="asset-id" />
            <hp>world</hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'two paragraphs',
      input: (
        <hul>
          <hli>
            <hp>
              hello <cursor />
            </hp>
          </hli>
        </hul>
      ),
      fragment: (
        <fragment>
          <hp>world</hp>
          <hp>line 2</hp>
        </fragment>
      ),
      expected: (
        <hul>
          <hli>
            <hp>hello world</hp>
            <hp>line 2</hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'two headings',
      input: (
        <hul>
          <hli>
            <hp>
              hello <cursor />
            </hp>
          </hli>
        </hul>
      ),
      fragment: (
        <fragment>
          <hh1>world</hh1>
          <hh1>line 2</hh1>
        </fragment>
      ),
      expected: (
        <hul>
          <hli>
            <hp>hello world</hp>
            <hh1>line 2</hh1>
          </hli>
        </hul>
      ),
    },
    {
      title: 'two paragraphs wrapped in a li',
      input: (
        <hul>
          <hli>
            <hp>
              hello <cursor />
            </hp>
          </hli>
        </hul>
      ),
      fragment: (
        <fragment>
          <hli>
            <hp>world</hp>
            <hp>line 2</hp>
          </hli>
        </fragment>
      ),
      expected: (
        <hul>
          <hli>
            <hp>hello </hp>
            <hul>
              <hli>
                <hp>world</hp>
                <hp>line 2</hp>
              </hli>
            </hul>
          </hli>
        </hul>
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

      editor.insertFragment(t.fragment as any);

      assertOutput({
        editor,
        expected: render(t.expected),
      });
    });
  }
});

// Pasting an ordered list over existing content must keep it ordered.
describe('insert ordered list fragment over a selection', () => {
  const orderedFragment = (
    <fragment>
      <hol>
        <hli>
          <hp>item one</hp>
        </hli>
        <hli>
          <hp>item two</hp>
        </hli>
      </hol>
    </fragment>
  );

  test('keeps the ordered list type when the selection is inside an unordered list item', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hul>
            <hli>
              <hp>
                <anchor />
                old
                <focus />
              </hp>
            </hli>
          </hul>
          <hp>
            <htext />
          </hp>
        </editor>
      ),
    });

    editor.insertFragment(orderedFragment as any);

    expect(pastedItemsOf(editor.children as any[], BLOCKS.OL_LIST)).toEqual([
      'item one',
      'item two',
    ]);
  });

  test('replacing a whole unordered list with an ordered list gives a top-level ordered list', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hul>
            <hli>
              <hp>
                <anchor />
                old
                <focus />
              </hp>
            </hli>
          </hul>
          <hp>
            <htext />
          </hp>
        </editor>
      ),
    });

    editor.insertFragment(orderedFragment as any);

    assertOutput({
      editor,
      expected: (
        <editor>
          <hol>
            <hli>
              <hp>item one</hp>
            </hli>
            <hli>
              <hp>item two</hp>
            </hli>
          </hol>
          <hp>
            <htext />
          </hp>
        </editor>
      ),
    });
  });

  test('keeps the ordered list type when the selection runs from a paragraph into a list', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hp>
            <anchor />
            hello
          </hp>
          <hul>
            <hli>
              <hp>
                old
                <focus />
              </hp>
            </hli>
          </hul>
          <hp>
            <htext />
          </hp>
        </editor>
      ),
    });

    editor.insertFragment(orderedFragment as any);

    expect(pastedItemsOf(editor.children as any[], BLOCKS.OL_LIST)).toEqual([
      'item one',
      'item two',
    ]);
  });

  test('pasting at a collapsed cursor inside an unordered list keeps the surrounding list type', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hul>
            <hli>
              <hp>
                hel
                <cursor />
                lo
              </hp>
            </hli>
          </hul>
          <hp>
            <htext />
          </hp>
        </editor>
      ),
    });

    editor.insertFragment(orderedFragment as any);

    // The pasted items are wrapped in the surrounding list's type (outer ul + nested ul).
    expect(findLists(editor.children as AnyNode[], BLOCKS.OL_LIST)).toHaveLength(0);
    expect(findLists(editor.children as AnyNode[], BLOCKS.UL_LIST)).toHaveLength(2);
  });

  test('keeps the ordered list type when the selection is in a plain paragraph', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hp>
            <anchor />
            hello
            <focus />
          </hp>
          <hp>
            <htext />
          </hp>
        </editor>
      ),
    });

    editor.insertFragment(orderedFragment as any);

    expect(pastedItemsOf(editor.children as any[], BLOCKS.OL_LIST)).toEqual([
      'item one',
      'item two',
    ]);
  });
});
