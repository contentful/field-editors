import { MARKS, BLOCKS } from '@contentful/rich-text-types';
import { document as doc, block, text } from '../../packages/rich-text/src/helpers/nodeFactory';

function expectRichTextFieldValue(expectedValue, editorEvents?) {
  cy.getRichTextField().then((field) => {
    expect(field.getValue()).to.deep.eq(expectedValue);
  });

  if (editorEvents) {
    cy.editorEvents().should('deep.include', { ...editorEvents, value: expectedValue });
  }
}

describe('Rich Text Editor', () => {
  let editor: () => Cypress.Chainable<any>;

  // copied from the 'is-hotkey' library we use for RichText shortcuts
  const IS_MAC =
    typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
  const mod = IS_MAC ? 'meta' : 'control';

  beforeEach(() => {
    cy.visit('/rich-text');
    const wrapper = () => cy.findByTestId('rich-text-editor-integration-test');
    editor = () => wrapper().find('[data-slate-editor=true]');
    wrapper().should('be.visible');
    editor().should('be.visible');
  });

  it('is empty by default', () => {
    cy.editorEvents().should('deep.equal', []);
  });

  it('allows typing', () => {
    editor().click().typeInSlate('some text').click();

    cy.wait(500);

    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text')));

    expectRichTextFieldValue(expectedValue);
  });

  it('supports undo and redo', () => {
    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text.')));

    // type
    editor().click().typeInSlate('some text.').click();

    cy.wait(500);

    expectRichTextFieldValue(expectedValue, { id: 3, type: 'setValue' });

    // undo
    editor().click().type(`{${mod}}z`).click();
    expectRichTextFieldValue(undefined, { id: 6, type: 'removeValue' });

    // redo
    editor().click().type(`{${mod}}{shift}z`).click();
    expectRichTextFieldValue(expectedValue, { id: 9, type: 'setValue' });
  });

  describe('Marks', () => {
    [
      [MARKS.BOLD, `{${mod}}b`],
      [MARKS.ITALIC, `{${mod}}i`],
      [MARKS.UNDERLINE, `{${mod}}u`],
      [MARKS.CODE, `{${mod}}/`],
    ].forEach(([mark, shortcut]) => {
      // TODO: unskip when toolbar is available
      // const toggleMarkViaToolbar = () => cy.findByTestId(`toolbar-toggle-${mark}`).click();
      // const toggleMarkViaShortcut = () => editor.type(shortcut);

      [
        // TODO: unskip when toolbar is available
        // ['toolbar', toggleMarkViaToolbar],
        ['shortcut' /*, toggleMarkViaShortcut */],
      ].forEach(([toggleType]) => {
        describe(`${mark} mark toggle via ${toggleType}`, () => {
          it('allows writing marked text', () => {
            editor().click().type(shortcut).typeInSlate('some text');

            cy.wait(600);

            const expectedValue = doc(
              block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
            );

            expectRichTextFieldValue(expectedValue);
          });

          it('allows writing unmarked text', () => {
            editor().click().type(shortcut).type(shortcut).typeInSlate('some text');

            cy.wait(600);

            const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

            expectRichTextFieldValue(expectedValue);
          });
        });
      });
    });
  });

  describe('HR', () => {
    describe('toolbar button', () => {
      function getHrToolbarButton() {
        return cy.findByTestId('hr-toolbar-button');
      }

      it('should be visible', () => {
        getHrToolbarButton().should('be.visible');
      });

      it('should add a new line when clicking', () => {
        editor().click().typeInSlate('some text');

        getHrToolbarButton().click();

        cy.wait(600);

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should end with an empty paragraph', () => {
        editor().click().typeInSlate('some text');

        getHrToolbarButton().click();
        getHrToolbarButton().click();
        getHrToolbarButton().click();

        cy.wait(600);

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });
    });
  });

  describe('Headings', () => {
    function getDropdownToolbarButton() {
      return cy.findByTestId('dropdown-heading');
    }

    function getDropdownList() {
      return cy.findByTestId('dropdown-heading-list');
    }

    function getDropdownItem(type: string) {
      return cy.findByTestId(`dropdown-option-${type}`);
    }

    const headings = [
      [BLOCKS.PARAGRAPH, 'Normal text'],
      [BLOCKS.HEADING_1, 'Heading 1', `{${mod}}{alt}1`],
      [BLOCKS.HEADING_2, 'Heading 2', `{${mod}}{alt}2`],
      [BLOCKS.HEADING_3, 'Heading 3', `{${mod}}{alt}3`],
      [BLOCKS.HEADING_4, 'Heading 4', `{${mod}}{alt}4`],
      [BLOCKS.HEADING_5, 'Heading 5', `{${mod}}{alt}5`],
      [BLOCKS.HEADING_6, 'Heading 6', `{${mod}}{alt}6`],
    ];

    headings.forEach(([type, label, shortcut]) => {
      describe(label, () => {
        it(`allows typing ${label} (${type})`, () => {
          editor().click().typeInSlate('some text');

          getDropdownToolbarButton().click();
          getDropdownItem(type).click();

          const expectedValue = doc(block(type, {}, text('some text', [])));
          expectRichTextFieldValue(expectedValue);
        });

        if (shortcut) {
          it(`allows writing ${label} (${type}) via hotkeys ${shortcut}`, () => {
            editor().click().type(shortcut).typeInSlate('some text');

            cy.wait(600);

            const expectedValue = doc(block(type, {}, text('some text', [])));

            expectRichTextFieldValue(expectedValue);
          });
        }

        it(`should set the dropdown label to ${label}`, () => {
          editor().click().typeInSlate('some text');

          getDropdownToolbarButton().click();
          getDropdownItem(type).click();

          getDropdownToolbarButton().should('have.text', label);
        });
      });
    });

    describe('Toolbar', () => {
      it('should be visible', () => {
        getDropdownToolbarButton().should('be.visible');

        getDropdownToolbarButton().click();
        getDropdownList().should('be.visible');
      });

      it(`should have ${headings.length} items`, () => {
        getDropdownToolbarButton().click();
        getDropdownList().children().should('have.length', headings.length);

        headings.forEach(([, label], index) => {
          getDropdownList().children().eq(index).should('have.text', label);
        });
      });
    });
  });

  describe.skip('Quote', () => {
    describe('quote button', () => {
      function getQuoteToolbarButton() {
        return cy.findByTestId('quote-toolbar-button');
      }

      it('should be visible', () => {
        getQuoteToolbarButton().should('be.visible');
      });

      it('should add a block quote when clicking followed by a trailing empty paragraph', () => {
        editor().click();

        getQuoteToolbarButton().click();

        cy.wait(600);

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should convert existing paragraph into a block quote', () => {
        editor().click().typeInSlate('some text');

        getQuoteToolbarButton().click();

        cy.wait(600);

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should convert block quote back to paragraph', () => {
        editor().click().typeInSlate('some text');

        getQuoteToolbarButton().click();
        getQuoteToolbarButton().click();

        cy.wait(600);

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should add multi-paragraph block quotes', () => {
        editor().click().typeInSlate('paragraph 1');

        getQuoteToolbarButton().click();

        editor().type('{enter}').typeInSlate('paragraph 2');

        cy.wait(600);

        const expectedValue = doc(
          block(
            BLOCKS.QUOTE,
            {},
            block(BLOCKS.PARAGRAPH, {}, text('paragraph 1', [])),
            block(BLOCKS.PARAGRAPH, {}, text('paragraph 2', []))
          ),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });
    });
  });
});
