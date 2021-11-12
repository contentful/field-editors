import { document as doc, block, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { BLOCKS } from '@contentful/rich-text-types';

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

    // Adjust this later when we support pasting other elements
    it('pastes only the text content of other blocks', () => {
      richText.editor.click();
      richText.toolbar.ul.click();

      richText.editor.type('Item #1');

      richText.editor.paste({
        'text/html':
          '<div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0">\n</span></span></span></div><table data-slate-node="element" class="css-11mv40a" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlNUQlMkMlMjJpc1ZvaWQlMjIlM0FmYWxzZSUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1yb3clMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1oZWFkZXItY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkhlYWRlciUyMDElMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtaGVhZGVyLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIZWFkZXIlMjAyJTIyJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJDZWxsJTIwMSUyMiU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyQ2VsbCUyMDIlMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE"><tbody><tr data-slate-node="element" class="css-1uop5es"><th data-slate-node="element" class="css-cg2mfz"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_5450" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Header 1</span></span></span></div></th><th data-slate-node="element" class="css-cg2mfz"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_4011" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Header 2</span></span></span></div></th></tr><tr data-slate-node="element" class="css-1uop5es"><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_2666" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Cell 1</span></span></span></div></td><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_5670" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Cell 2</span></span></span></div></td></tr></tbody></table><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0">\n</span></span></span></div>',
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
              block(BLOCKS.PARAGRAPH, {}, text('Header 1 Header 2 Cell 1 Cell 2'))
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        )
      );
    });
  });
});
