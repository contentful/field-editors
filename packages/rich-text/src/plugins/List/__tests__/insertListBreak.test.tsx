/** @jsx jsx */
import { jsx, assertOutput, createTestEditor } from '../../../test-utils';

describe('insert line break', () => {
  const tests = [
    // single p
    {
      title: 'at the start of a li',
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
              <cursor />
            </hp>
          </hli>

          <hli>
            <hp>p1</hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at the end of a li',
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
            <hp>p1</hp>
          </hli>

          <hli>
            <hp>
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at the middle of a li',
      input: (
        <hul>
          <hli>
            <hp>
              split <cursor />
              me
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>split </hp>
          </hli>

          <hli>
            <hp>
              <cursor />
              me
            </hp>
          </hli>
        </hul>
      ),
    },
    // multi p
    {
      title: 'at the start of a li with multiple p',
      input: (
        <hul>
          <hli>
            <hp>
              <cursor />
              p1
            </hp>
            <hp>p2</hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>
              <cursor />
            </hp>
          </hli>

          <hli>
            <hp>p1</hp>
            <hp>p2</hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at the start of the second p of a li',
      input: (
        <hul>
          <hli>
            <hp>p1</hp>
            <hp>
              <cursor />
              p2
            </hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>p1</hp>
          </hli>

          <hli>
            <hp>
              <cursor />
            </hp>
            <hp>p2</hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at the end of a li with multiple p',
      input: (
        <hul>
          <hli>
            <hp>p1</hp>
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
            <hp>p2</hp>
          </hli>

          <hli>
            <hp>
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at the middle of a li with multiple p',
      input: (
        <hul>
          <hli>
            <hp>
              split <cursor />
              me
            </hp>
            <hp>move me</hp>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>split </hp>
          </hli>

          <hli>
            <hp>
              <cursor />
              me
            </hp>
            <hp>move me</hp>
          </hli>
        </hul>
      ),
    },
    // with headings
    {
      title: 'at the start of a li with heading',
      input: (
        <hul>
          <hli>
            <hh1>
              <cursor />
              p1
            </hh1>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>
              <cursor />
            </hp>
          </hli>

          <hli>
            <hh1>p1</hh1>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at the end of a li with heading',
      input: (
        <hul>
          <hli>
            <hh1>
              p1
              <cursor />
            </hh1>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hh1>p1</hh1>
          </hli>

          <hli>
            <hp>
              <cursor />
            </hp>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at the middle of a li with heading',
      input: (
        <hul>
          <hli>
            <hh1>
              split <cursor />
              me
            </hh1>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hh1>split </hh1>
          </hli>

          <hli>
            <hh1>
              <cursor />
              me
            </hh1>
          </hli>
        </hul>
      ),
    },
    {
      title: 'at a li with nested list',
      input: (
        <hul>
          <hli>
            <hp>item 1</hp>
          </hli>
          <hli>
            <hp>
              item 2<cursor />
            </hp>
            <hul>
              <hli>
                <hp>sub list</hp>
              </hli>
            </hul>
          </hli>
        </hul>
      ),
      expected: (
        <hul>
          <hli>
            <hp>item 1</hp>
          </hli>
          <hli>
            <hp>item 2</hp>
          </hli>
          <hli>
            <hp>
              <cursor />
            </hp>
            <hul>
              <hli>
                <hp>sub list</hp>
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

      // Equivalent of pressing ENTER
      editor.insertBreak();

      assertOutput({
        editor,
        expected: render(t.expected),
      });
    });
  }
});
