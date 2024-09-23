/** @jsx jsx */
import { jsx, assertOutput, createTestEditor } from '../../../test-utils';
import { moveListItems } from './moveListItems';

describe('moving list items (up/down)', () => {
  type ListTest = {
    title: string;
    input: JSX.Element;
    expected: JSX.Element;
  };

  const renderEditor = (children: any) => (
    <editor>
      {children}
      <hp>
        <htext />
      </hp>
    </editor>
  );

  const assertTab = (t: ListTest, shift = false) => {
    test(t.title, () => {
      const { editor } = createTestEditor({
        input: renderEditor(t.input),
      });

      // Equivalent of pressing (SHIFT+)TAB
      moveListItems(editor, { increase: !shift });

      assertOutput({
        editor,
        expected: renderEditor(t.expected),
      });
    });
  };

  const tests: ListTest[] = [
    {
      title: 'single paragraph',
      input: (
        <hul>
          <hli>
            <hp>p1</hp>
          </hli>
          <hli>
            <hp>
              p2
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hul>
              <hli>
                <hp>
                  p2
                  <cursor />
                </hp>
              </hli>
            </hul>
          </hli>
        </hul>
      ),
    },
    {
      title: 'multiple paragraphs',
      input: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hp>p2</hp>
          </hli>
          <hli>
            <hp>
              p3
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hp>p2</hp>
            <hul>
              <hli>
                <hp>
                  p3
                  <cursor />
                </hp>
              </hli>
            </hul>
          </hli>
        </hul>
      ),
    },
    {
      title: 'multiple elements',
      input: (
        <hul>
          <hli>
            <hp>a</hp>
            <hp>b</hp>
            <hquote>
              <hp>quote</hp>
            </hquote>
          </hli>
          <hli>
            <hp>
              c<cursor />
            </hp>
            <hp>d</hp>
            <hembed type="Asset" id="asset-id" />
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>a</hp>
            <hp>b</hp>
            <hquote>
              <hp>quote</hp>
            </hquote>
            <hul>
              <hli>
                <hp>
                  c<cursor />
                </hp>
                <hp>d</hp>
                <hembed type="Asset" id="asset-id" />
              </hli>
            </hul>
          </hli>
        </hul>
      ),
    },
    {
      title: 'with a sub-list',
      input: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hul>
              <hli>
                <hp>sub p1</hp>
              </hli>
            </hul>
          </hli>
          <hli>
            <hp>
              p2
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hul>
              <hli>
                <hp>sub p1</hp>
              </hli>
              <hli>
                <hp>
                  p2
                  <cursor />
                </hp>
              </hli>
            </hul>
          </hli>
        </hul>
      ),
    },
    {
      title: 'with a sub-list as non-last child',
      input: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hul>
              <hli>
                <hp>sub p1</hp>
              </hli>
            </hul>
            <hembed type="Entry" id="entry-id" />
          </hli>
          <hli>
            <hp>
              p2
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hul>
              <hli>
                <hp>sub p1</hp>
              </hli>
              <hli>
                <hp>
                  p2
                  <cursor />
                </hp>
              </hli>
            </hul>
            <hembed type="Entry" id="entry-id" />
          </hli>
        </hul>
      ),
    },
  ];

  describe('move down (aka. tab)', () => {
    tests.forEach((t) => assertTab(t));
  });

  describe('move up (aka. shift+tab)', () => {
    tests
      .map((t) => ({
        ...t,
        input: t.expected,
        expected: t.input,
      }))
      .forEach((t) => assertTab(t, true));
  });
});
