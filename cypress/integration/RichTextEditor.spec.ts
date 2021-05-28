import { MARKS, BLOCKS } from '@contentful/rich-text-types';
import { document as doc, block, text } from '../../packages/rich-text/src/helpers/nodeFactory';

function expectRichTextFieldValue(expectedValue) {
  cy.getRichTextField().then((field) => {
    console.log({
      fieldValue: JSON.stringify(field.getValue(), null, 2),
      expectedValue: JSON.stringify(expectedValue, null, 2),
    });
    expect(field.getValue()).to.deep.eq(expectedValue);
  });

  // cy.editorEvents().should('deep.include', { id: 1, type: 'setValue', value: expectedValue });
}

describe('Rich Text Editor', () => {
  let editor;

  // copied from the 'is-hotkey' library we use for RichText shortcuts
  const IS_MAC =
    typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
  const mod = IS_MAC ? 'meta' : 'control';

  function getEditor() {
    return cy.get('[data-slate-editor=true]').click();
  }

  beforeEach(() => {
    cy.visit('/rich-text');
    const wrapper = cy.findByTestId('rich-text-editor-integration-test').should('be.visible');
    editor = wrapper.find('[data-slate-editor=true]').should('be.visible');
  });

  it('is empty by default', () => {
    cy.editorEvents().should('deep.equal', []);
  });

  it('allows typing', () => {
    editor.click().typeInSlate('some text').click();

    cy.wait(500);

    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text')));

    expectRichTextFieldValue(expectedValue);
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
            editor.click().type(shortcut).typeInSlate('some text');

            // updates to RichText value are debounced with 600 to compensate any kind of latency, original value is 500
            cy.wait(600);

            const expectedValue = doc(
              block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
            );

            expectRichTextFieldValue(expectedValue);
          });

          it('allows writing unmarked text', () => {
            editor.click().type(shortcut).type(shortcut).typeInSlate('some text');

            // updates to RichText value are debounced with 600 to compensate any kind of latency, original value is 500
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
        editor.click().typeInSlate('some text');

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
        editor.click().typeInSlate('some text');

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

  describe.only('Headings', () => {
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
          getEditor();

          getDropdownToolbarButton().click();
          getDropdownItem(type).click();
          getEditor().typeInSlate('some text');

          const expectedValue = doc(block(type, {}, text('some text', [])));
          expectRichTextFieldValue(expectedValue);
        });

        if (shortcut) {
          it(`allows writing ${label} (${type}) via hotkeys ${shortcut}`, () => {
            getEditor().type(shortcut).typeInSlate('some text');

            const expectedValue = doc(block(type, {}, text('some text', [])));
            expectRichTextFieldValue(expectedValue);
          });
        }

        it(`should set the dropdown label to ${label}`, () => {
          getEditor();

          getDropdownToolbarButton().click();
          getDropdownItem(type).click();
          getEditor().typeInSlate('some text');

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
});
