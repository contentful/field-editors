/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Quotes', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  // copied from the 'is-hotkey' library we use for RichText shortcuts
  const IS_MAC =
    typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

  const mod = IS_MAC ? 'meta' : 'control';

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  const methods: [string, () => void][] = [
    [
      'using the toolbar',
      () => {
        richText.toolbar.quote.click();
      },
    ],
    [
      'using hotkey (mod+shift+1)',
      () => {
        richText.editor.type(`{${mod}}{shift}1`);
      },
    ],
  ];

  for (const [scenario, toggleQuote] of methods) {
    describe(scenario, () => {
      it('the toolbar button should be visible', () => {
        richText.toolbar.quote.should('be.visible');
      });

      it('should toggle off empty quotes on backspace', () => {
        richText.editor.click();

        toggleQuote();

        richText.editor.type('{backspace}');

        richText.expectSnapshotValue();
      });

      it('should add a block quote when clicking followed by a trailing empty paragraph', () => {
        richText.editor.click();

        toggleQuote();

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should convert existing paragraph into a block quote', () => {
        richText.editor.click().type('some text');

        toggleQuote();

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should convert block quote back to paragraph', () => {
        richText.editor.click().type('some text');

        toggleQuote();
        toggleQuote();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should add multi-paragraph block quotes', () => {
        richText.editor.click().type('paragraph 1');

        toggleQuote();

        richText.editor.type('{enter}').type('paragraph 2');

        const expectedValue = doc(
          block(
            BLOCKS.QUOTE,
            {},
            block(BLOCKS.PARAGRAPH, {}, text('paragraph 1', [])),
            block(BLOCKS.PARAGRAPH, {}, text('paragraph 2', []))
          ),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should preserve marks & inline elements', () => {
        richText.editor.click();
        // bold underline italic code [link] [inline-entry] more text
        richText.editor.paste({
          'application/x-slate-fragment':
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMmJvbGQlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIwJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjJpdGFsaWMlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyaXRhbGljJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMnVuZGVybGluZSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJ1bmRlcmxpbmUlMjIlM0F0cnVlJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMCUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyY29kZSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJjb2RlJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ1cmklMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUuY29tJTIyJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIydGV4dCUyMiUzQSUyMmxpbmslMjIlN0QlNUQlN0QlMkMlN0IlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIydGV4dCUyMiUzQSUyMiUyMCUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJlbWJlZGRlZC1lbnRyeS1pbmxpbmUlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlMkMlMjJkYXRhJTIyJTNBJTdCJTIydGFyZ2V0JTIyJTNBJTdCJTIyc3lzJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjJleGFtcGxlLWVudGl0eS1pZCUyMiUyQyUyMnR5cGUlMjIlM0ElMjJMaW5rJTIyJTJDJTIybGlua1R5cGUlMjIlM0ElMjJFbnRyeSUyMiU3RCU3RCU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjBtb3JlJTIwdGV4dCUyMiU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RA==',
        });

        toggleQuote();

        richText.expectSnapshotValue();
      });
    });
  }
});
