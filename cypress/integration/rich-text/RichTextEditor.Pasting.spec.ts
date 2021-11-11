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

  function paste(data: { [key: string]: string }) {
    const dataTransfer = new DataTransfer();

    for (const [format, value] of Object.entries(data)) {
      dataTransfer.setData(format, value);
    }

    // this is a weird combination of Event class, type & other properties
    // but necessary to pass all the Slate guard
    const inputEvent = new InputEvent('beforeinput', {
      inputType: 'insertFromPaste',
      bubbles: true,
      cancelable: true,
      // @ts-expect-ignore Slate looks for this property specifically
      dataTransfer,
    });
    const event = Object.assign(inputEvent, {
      getTargetRanges: () => [],
    });

    editor().click().trigger('beforeinput', event);
  }

  it.only('supports pasting', () => {
    const expectedValue = doc(
      block(
        BLOCKS.UL_LIST,
        {},
        block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item #1'))),
        block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item #2')))
      ),
      block(BLOCKS.PARAGRAPH, {}, text(''))
    );

    paste({
      'text/html': '<ul><li>item #1</li><li>item #2</li></ul>',
    });

    expectRichTextFieldValue(expectedValue);
  });
});
