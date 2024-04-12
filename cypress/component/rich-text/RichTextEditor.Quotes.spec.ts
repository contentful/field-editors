import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  text,
  inline,
  mark,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { mod } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Quotes', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;

  beforeEach(() => {
    richText = new RichTextPage();

    mountRichTextEditor();
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

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('')),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
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
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMmJvbGQlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIwJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjJpdGFsaWMlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyaXRhbGljJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMnVuZGVybGluZSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJ1bmRlcmxpbmUlMjIlM0F0cnVlJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMCUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyY29kZSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJjb2RlJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ1cmklMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUuY29tJTIyJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIydGV4dCUyMiUzQSUyMmxpbmslMjIlN0QlNUQlN0QlMkMlN0IlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIydGV4dCUyMiUzQSUyMiUyMCUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJlbWJlZGRlZC1lbnRyeS1pbmxpbmUlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlMkMlMjJkYXRhJTIyJTNBJTdCJTIydGFyZ2V0JTIyJTNBJTdCJTIyc3lzJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjJwdWJsaXNoZWQtZW50cnklMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyRW50cnklMjIlN0QlN0QlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIwbW9yZSUyMHRleHQlMjIlN0QlNUQlMkMlMjJpc1ZvaWQlMjIlM0FmYWxzZSUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlNUQ=',
        });

        toggleQuote();

        const expectedValue = doc(
          block(
            BLOCKS.QUOTE,
            {},
            block(
              BLOCKS.PARAGRAPH,
              {},
              text('bold', [mark(MARKS.BOLD)]),
              text(' '),
              text('italic', [mark(MARKS.ITALIC)]),
              text(' '),
              text('underline', [mark(MARKS.UNDERLINE)]),
              text(' '),
              text('code', [mark(MARKS.CODE)]),
              text(' '),
              inline(INLINES.HYPERLINK, { uri: 'https://example.com' }, text('link')),
              text(' '),
              inline(INLINES.EMBEDDED_ENTRY, {
                target: {
                  sys: {
                    id: 'published-entry',
                    linkType: 'Entry',
                    type: 'Link',
                  },
                },
              }),
              text(' more text')
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('should preserve resource links inline elements', () => {
        richText.editor.click();
        // bold underline italic code [link] [inline-entry] more text
        richText.editor.paste({
          'application/x-slate-fragment':
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJyZXNvdXJjZS1oeXBlcmxpbmslMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIydGFyZ2V0JTIyJTNBJTdCJTIyc3lzJTIyJTNBJTdCJTIydXJuJTIyJTNBJTIyY3JuJTNBY29udGVudGZ1bCUzQSUzQSUzQWNvbnRlbnQlM0FzcGFjZXMlMkZpbmRpZmZlcmVudCUyRmVudHJpZXMlMkZwdWJsaXNoZWQtZW50cnklMjIlMkMlMjJ0eXBlJTIyJTNBJTIyUmVzb3VyY2VMaW5rJTIyJTJDJTIybGlua1R5cGUlMjIlM0ElMjJDb250ZW50ZnVsJTNBRW50cnklMjIlN0QlN0QlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJyZXNvdXJjZUh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlNUQlN0QlMkMlN0IlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIydGV4dCUyMiUzQSUyMiUyMGFuZCUyMGlubGluZSUyMHJlc291cmNlJTNBJTIwJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmVtYmVkZGVkLXJlc291cmNlLWlubGluZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJ1cm4lMjIlM0ElMjJjcm4lM0Fjb250ZW50ZnVsJTNBJTNBJTNBY29udGVudCUzQXNwYWNlcyUyRmluZGlmZmVyZW50JTJGZW50cmllcyUyRnB1Ymxpc2hlZC1lbnRyeSUyMiUyQyUyMnR5cGUlMjIlM0ElMjJSZXNvdXJjZUxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkNvbnRlbnRmdWwlM0FFbnRyeSUyMiU3RCU3RCU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlMkMlMjJpc1ZvaWQlMjIlM0FmYWxzZSUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlNUQ=',
        });

        toggleQuote();

        const expectedValue = doc(
          block(
            BLOCKS.QUOTE,
            {},
            block(
              BLOCKS.PARAGRAPH,
              {},
              text(''),
              inline(
                INLINES.RESOURCE_HYPERLINK,
                {
                  target: {
                    sys: {
                      type: 'ResourceLink',
                      linkType: 'Contentful:Entry',
                      urn: 'crn:contentful:::content:spaces/indifferent/entries/published-entry',
                    },
                  },
                },
                text('resourceHyperlink')
              ),
              text(' and inline resource: '),
              inline(INLINES.EMBEDDED_RESOURCE, {
                target: {
                  sys: {
                    type: 'ResourceLink',
                    linkType: 'Contentful:Entry',
                    urn: 'crn:contentful:::content:spaces/indifferent/entries/published-entry',
                  },
                },
              }),
              text('')
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );
        richText.expectValue(expectedValue);
      });
    });
  }
});
