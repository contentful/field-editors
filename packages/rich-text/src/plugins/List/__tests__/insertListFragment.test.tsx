/** @jsx jsx */
import { jsx, assertOutput, createTestEditor } from '../../../test-utils';

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
