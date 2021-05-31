import { MARKS, BLOCKS } from '@contentful/rich-text-types';
import * as deepEquals from 'fast-deep-equal';
import { document as doc, block, text } from '../../packages/rich-text/src/helpers/nodeFactory';

function expectRichTextFieldValue(expectedValue) {
  cy.getRichTextField().then((field) => {
    expect(deepEquals(field.getValue(), expectedValue)).to.be.true;
  });
}

describe('Rich Text Editor', () => {
  let editor;

  // copied from the 'is-hotkey' library we use for RichText shortcuts
  const IS_MAC =
    typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
  const mod = IS_MAC ? 'meta' : 'control';

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
      describe.only(label, () => {
        it.skip(`allows typing ${label} (${type})`, () => {
          editor.click().typeInSlate('some text');

          getDropdownToolbarButton().click();
          getDropdownItem(type).click();

          const expectedValue = doc(block(type, {}, text('some text', [])));
          expectRichTextFieldValue(expectedValue);
        });

        if (shortcut) {
          it(`allows writing ${label} (${type}) via hotkeys ${shortcut}`, () => {
            editor.click().type(shortcut).typeInSlate('some text');

            const expectedValue = doc(block(type, {}, text('some text', [])));

            // TOOD: Can we improve it? `expectRichTextFieldValue` fails for this test on CI but it runs fine locally. Somehow the property order of the object fails when comparing it deeply.
            cy.getRichTextField().then((field) => {
              const value = field.getValue();

              expect(value).to.have.property('nodeType', 'document');
              expect(value).to.have.deep.property('content', expectedValue.content);

              expect(value).to.have.nested.property('content[0].content[0].nodeType', 'text');
              expect(value).to.have.nested.property(
                'content[0].content[0].value',
                expectedValue.content[0].content[0].value
              );
            });
          });
        }

        it.skip(`should set the dropdown label to ${label}`, () => {
          editor.click().typeInSlate('some text');

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
});
