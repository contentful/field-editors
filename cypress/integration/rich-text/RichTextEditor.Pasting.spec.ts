import {
  document as doc,
  block,
  inline,
  text,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen
describe('Rich Text Editor', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  describe('Lists', () => {
    it('supports pasting of a simple list', () => {
      const expectedValue = doc(
        block(
          BLOCKS.UL_LIST,
          {},
          block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item #1'))),
          block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item #2')))
        ),
        block(BLOCKS.PARAGRAPH, {}, text(''))
      );

      richText.editor.click().paste({
        'text/html': '<ul><li>item #1</li><li>item #2</li></ul>',
      });

      richText.expectValue(expectedValue);
    });

    it('pastes texts inside lists', () => {
      richText.editor.click();
      richText.toolbar.ul.click();

      richText.editor.type('Hello ');

      richText.editor.paste({
        'text/plain': 'world!',
      });

      richText.expectValue(
        doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('Hello world!')))
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        )
      );
    });

    it('pastes elements inside links', () => {
      richText.editor.click();
      richText.toolbar.ul.click();

      richText.editor.paste({
        'text/html':
          '<meta charset=\'utf-8\'><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">This is a </span></span></span><span class="css-1wt9k1k"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" rel="noopener noreferrer" aria-describedby="tooltip_9004" href="https://example.com"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">link</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true"> and an inline entry: </span></span></span><span data-slate-node="element" data-slate-inline="true" data-slate-void="true" class="css-1dx5s2y" data-embedded-entity-inline-id="example-entity-id" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlRoaXMlMjBpcyUyMGElMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ1cmklMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUuY29tJTIyJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIybGluayUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjBhbmQlMjBhbiUyMGlubGluZSUyMGVudHJ5JTNBJTIwJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmVtYmVkZGVkLWVudHJ5LWlubGluZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJpZCUyMiUzQSUyMmV4YW1wbGUtZW50aXR5LWlkJTIyJTJDJTIydHlwZSUyMiUzQSUyMkxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkVudHJ5JTIyJTdEJTdEJTdEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RA=="><span contenteditable="false" draggable="true"><article class="css-122osjo" data-test-id="embedded-entry-inline"><div class="css-1sz1u6f" data-card-part="wrapper"><button type="button" aria-label="Actions" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_8727" data-test-id="cf-ui-card-actions" class="css-2ulqgl"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"></path><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></span></button><div class="css-123a08z" data-card-part="content"><span class="css-1eadhne"><span>Example Content Type The best article ever</span></span></div></div></article></span><span data-slate-spacer="true" style="height: 0px; color: transparent; outline: none; position: absolute;"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></span></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span>',
      });

      richText.expectValue(
        doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('This is a '),
                inline(INLINES.HYPERLINK, { uri: 'https://example.com' }, text('link')),
                text(' and an inline entry: '),
                inline(INLINES.EMBEDDED_ENTRY, {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Entry',
                    },
                  },
                }),
                text('')
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        )
      );
    });

    it('pastes list items as new lists inside lists', () => {
      richText.editor.click();
      richText.toolbar.ul.click();

      richText.editor.type('Hello');

      richText.editor.paste({
        'text/html':
          '<meta charset=\'utf-8\'><ul data-slate-node="element" class="css-a9oioc" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnVub3JkZXJlZC1saXN0JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIybGlzdC1pdGVtJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyd29ybGQhJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE"><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">world!</span></strong></span></span></div></li></ul>',
      });

      richText.expectValue(
        doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('Hello')),
              block(
                BLOCKS.UL_LIST,
                {},
                block(
                  BLOCKS.LIST_ITEM,
                  {},
                  block(BLOCKS.PARAGRAPH, {}, text('world!', [{ type: 'bold' }]))
                )
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        )
      );
    });

    it('confers the parent list type upon list items pasted within lists', () => {
      richText.editor.click();
      richText.toolbar.ol.click();

      richText.editor.type('Hello');

      richText.editor.paste({
        'text/html':
          '<meta charset=\'utf-8\'><ul data-slate-node="element" class="css-a9oioc" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnVub3JkZXJlZC1saXN0JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIybGlzdC1pdGVtJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyd29ybGQhJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE"><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">world!</span></strong></span></span></div></li></ul>',
      });

      richText.expectValue(
        doc(
          block(
            BLOCKS.OL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('Hello')),
              block(
                BLOCKS.OL_LIST,
                {},
                block(
                  BLOCKS.LIST_ITEM,
                  {},
                  block(BLOCKS.PARAGRAPH, {}, text('world!', [{ type: 'bold' }]))
                )
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        )
      );
    });

    it('pastes orphaned list items as unordered lists', () => {
      richText.editor.click();

      richText.editor.paste({
        'text/html':
          '<meta charset=\'utf-8\'><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Hello</span></span></span></div><ul data-slate-node="element" class="css-a9oioc"><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">world!</span></strong></span></span></div></li></ul></li><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0">\n</span></span></span></div>',
      });

      richText.expectValue(
        doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('Hello')),
              block(
                BLOCKS.UL_LIST,
                {},
                block(
                  BLOCKS.LIST_ITEM,
                  {},
                  block(BLOCKS.PARAGRAPH, {}, text('world!', [{ type: 'bold' }]))
                )
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        )
      );
    });

    it('pastes only the text content of other blocks', () => {
      richText.editor.click();
      richText.toolbar.ul.click();

      richText.editor.type('Item #1');

      richText.editor.paste({
        'text/html':
          '<meta charset=\'utf-8\'><tr data-slate-node="element" class="css-1uop5es"><th data-slate-node="element" class="css-cg2mfz"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">Header 1</span></strong></span></span></div></th><th data-slate-node="element" class="css-cg2mfz"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_3199" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Header 2 (</span></span></span><span class="css-1wt9k1k"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" rel="noopener noreferrer" aria-describedby="tooltip_5239" href="https://example.com"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">with link</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">)</span></span></span></div></th></tr><tr data-slate-node="element" class="css-1uop5es" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtaGVhZGVyLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIZWFkZXIlMjAxJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtaGVhZGVyLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIZWFkZXIlMjAyJTIwKCUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJoeXBlcmxpbmslMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIydXJpJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZleGFtcGxlLmNvbSUyMiU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMndpdGglMjBsaW5rJTIyJTdEJTVEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiklMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkNlbGwlMjAxJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkNlbGwlMjAyJTIyJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTVE"><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_5758" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">Cell 1</span></strong></span></span></div></td><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_4160" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Cell 2</span></span></span></div></td></tr>',
      });

      richText.expectValue(
        doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('Item #1')),
              block(BLOCKS.PARAGRAPH, {}, text('Header 1', [{ type: 'bold' }])),
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('Header 2 ('),
                inline(INLINES.HYPERLINK, { uri: 'https://example.com' }, text('with link')),
                text(')')
              ),
              block(BLOCKS.PARAGRAPH, {}, text('Cell 1', [{ type: 'bold' }])),
              block(BLOCKS.PARAGRAPH, {}, text('Cell 2'))
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        )
      );
    });
  });
});
