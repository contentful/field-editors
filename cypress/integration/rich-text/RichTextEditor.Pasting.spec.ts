import { expectRichTextFieldValue } from './utils';
import { document as doc, block, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { BLOCKS } from '@contentful/rich-text-types';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen
describe('Rich Text Editor', { viewportHeight: 2000 }, () => {
  let editor: () => Cypress.Chainable<any>;

  beforeEach(() => {
    cy.visit('/rich-text');
    const wrapper = () => cy.findByTestId('rich-text-editor-integration-test');
    editor = () => wrapper().find('[data-slate-editor=true]');
    wrapper().should('be.visible');
    editor().should('be.visible');
  });

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

    editor().click().paste({
      'text/html': '<ul><li>item #1</li><li>item #2</li></ul>',
    });

    expectRichTextFieldValue(expectedValue);
  });
});
