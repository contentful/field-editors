/* eslint-disable mocha/no-setup-in-describe */

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

  function getDropdownToolbarButton() {
    return cy.findByTestId('dropdown-heading');
  }

  function getDropdownList() {
    return cy.findByTestId('dropdown-heading-list');
  }

  function getDropdownItem(type: string) {
    return cy.findByTestId(`dropdown-option-${type}`);
  }

  function getUlToolbarButton() {
    return cy.findByTestId('ul-toolbar-button');
  }

  function getOlToolbarButton() {
    return cy.findByTestId('ol-toolbar-button');
  }

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
      const toggleMarkViaToolbar = () => cy.findByTestId(`${mark}-toolbar-button`).click();

      describe(`${mark} mark toggle via toolbar`, () => {
        it('allows writing marked text', () => {
          editor().click();

          toggleMarkViaToolbar();

          editor().typeInSlate('some text');

          cy.wait(600);

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          editor().click().typeInSlate('some text');

          cy.wait(100);

          editor().type('{selectall}');

          toggleMarkViaToolbar();

          cy.wait(600);

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          editor().click();

          toggleMarkViaToolbar();
          toggleMarkViaToolbar();

          editor().typeInSlate('some text');

          cy.wait(600);

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          editor().click().typeInSlate('some text');

          cy.wait(100);

          editor().type('{selectall}');

          toggleMarkViaToolbar();

          cy.wait(100);

          editor().click().type('{selectall}');

          toggleMarkViaToolbar();

          cy.wait(600);

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          expectRichTextFieldValue(expectedValue);
        });
      });

      describe(`${mark} mark toggle via shortcut`, () => {
        it('allows writing marked text', () => {
          editor().click().type(shortcut).typeInSlate('some text');

          cy.wait(600);

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          editor().click().typeInSlate('some text');

          cy.wait(100);

          editor().type('{selectall}').type(shortcut);

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

        it('allows writing unmarked text by selecting text', () => {
          editor().click().typeInSlate('some text');

          cy.wait(100);

          editor().type('{selectall}').type(shortcut).type('{selectall}').type(shortcut);

          cy.wait(600);

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          expectRichTextFieldValue(expectedValue);
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

  describe('Quote', () => {
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

  describe('Lists', () => {
    const lists = [
      { getList: getUlToolbarButton, listType: BLOCKS.UL_LIST, label: 'Unordered List (UL)' },
      { getList: getOlToolbarButton, listType: BLOCKS.OL_LIST, label: 'Ordered List (OL)' },
    ];

    lists.forEach((test) => {
      describe(test.label, () => {
        it('should be visible', () => {
          test.getList().should('be.visible');
        });

        it('should add a new list', () => {
          editor().click();

          test.getList().click();

          // TODO: Find a way to test deeper lists
          /*
            Having issues with `.type('{enter})` to break lines.
            The error is:
            Cannot resolve a Slate node from DOM node: [object HTMLSpanElement]
          */
          editor().click().typeInSlate('item 1');

          cy.wait(600);

          const expectedValue = doc(
            block(
              test.listType,
              {},
              block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item 1', [])))
            )
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('should untoggle the list', () => {
          editor().click();

          test.getList().click();

          editor().click().typeInSlate('some text');

          test.getList().click();

          cy.wait(600);

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          expectRichTextFieldValue(expectedValue);
        });
      });
    });
  });

  describe('New Line', () => {
    it('should add a new line on a paragraph', () => {
      editor()
        .click()
        .typeInSlate('some text 1')
        .type('{shift}{enter}')
        .typeInSlate('some text 2')
        .type('{shift}{enter}')
        .typeInSlate('some text 3');

      cy.wait(100);

      const expectedValue = doc(
        block(BLOCKS.PARAGRAPH, {}, text('some text 1\nsome text 2\nsome text 3'))
      );

      expectRichTextFieldValue(expectedValue);
    });

    it('should add a new line on a heading', () => {
      editor().click();

      getDropdownToolbarButton().click();
      getDropdownItem(BLOCKS.HEADING_1).click();

      editor()
        .click()
        .typeInSlate('some text 1')
        .type('{shift}{enter}')
        .typeInSlate('some text 2')
        .type('{shift}{enter}')
        .typeInSlate('some text 3');

      cy.wait(100);

      const expectedValue = doc(
        block(BLOCKS.HEADING_1, {}, text('some text 1\nsome text 2\nsome text 3'))
      );

      expectRichTextFieldValue(expectedValue);
    });

    it('should add a new line on a list', () => {
      editor().click();

      getUlToolbarButton().click();

      editor()
        .click()
        .typeInSlate('some text 1')
        .type('{shift}{enter}')
        .typeInSlate('some text 2')
        .type('{shift}{enter}')
        .typeInSlate('some text 3');

      cy.wait(100);

      const expectedValue = doc(
        block(
          BLOCKS.UL_LIST,
          {},
          block(
            BLOCKS.LIST_ITEM,
            {},
            block(BLOCKS.PARAGRAPH, {}, text('some text 1\nsome text 2\nsome text 3', []))
          )
        )
      );

      expectRichTextFieldValue(expectedValue);
    });
  });

  describe('Tables', () => { 
    const buildHelper = (type) => (...children) => block(type, {}, ...children);
    const table = buildHelper(BLOCKS.TABLE);
    const row = buildHelper(BLOCKS.TABLE_ROW);
    const cell = buildHelper(BLOCKS.TABLE_CELL);
    const paragraph = buildHelper(BLOCKS.PARAGRAPH);
    const paragraphWithText = (t) => paragraph(text(t, []));
    const emptyParagraph = () => paragraphWithText('');
    const emptyCell = () => cell(emptyParagraph());
    const cellWithText = (t) => cell(paragraphWithText(t));
    const insertTableWithExampleData = () => {
      editor()
        .type(`{${mod}}{,}`)
        .typeInSlate('foo')
        .type('{rightArrow}')
        .typeInSlate('bar')
        .type('{rightArrow}')
        .typeInSlate('baz')
        .type('{rightArrow}')
        .typeInSlate('quux')
    };
    const expectDocumentStructure = (...elements) => {
      cy.wait(100);
      expectRichTextFieldValue(
        doc(
          emptyParagraph(),
          ...elements,
          emptyParagraph(),
        )
      );
    }
    const expectTable = (...tableElements) => expectDocumentStructure(
      table(...tableElements)
    );
    const expectTableToBeDeleted = () => expectDocumentStructure();

    it('allows creating a table', () => {
      editor().type(`{${mod}}{,}`);

      expectTable(
        row(
          emptyCell(),
          emptyCell(),
        ),
        row(
          emptyCell(),
          emptyCell(),
        )
      );
    });

    it('allows filling a table with text', () => {
      insertTableWithExampleData();

      expectTable(
        row(
          cellWithText('foo'),
          cellWithText('bar'),
        ),
        row(
          cellWithText('baz'),
          cellWithText('quux'),
        )
      );
    });

    it('allows adding rows and columns', () => {
      insertTableWithExampleData();

      editor()
        .click()
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{rightArrow}`);

      expectTable(
        row(
          cellWithText('foo'),
          emptyCell(),
          cellWithText('bar'),
        ),
        row(
          cellWithText('baz'),
          emptyCell(),
          cellWithText('quux'),
        )
      );

      editor()
        .click()
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{downArrow}`);

      expectTable(
        row(
          cellWithText('foo'),
          emptyCell(),
          cellWithText('bar'),
        ),
        row(
          emptyCell(),
          emptyCell(),
          emptyCell(),
        ),
        row(
          cellWithText('baz'),
          emptyCell(),
          cellWithText('quux'),
        )
      );
    });

    it('allows deleting a table by selection deletion', () => {
      insertTableWithExampleData();

      editor()
        .click()
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{backspace}`);
      
      expectTable(
        row(cellWithText('bar')),
        row(cellWithText('quux')),
      );

      editor()
        .click()
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{backspace}`)

      expectTable(
        row(cellWithText('quux'))
      );

      editor()
        .click()
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{backspace}`)

      expectTableToBeDeleted();
    });

    it('allows removing rows and columns', () => {
      insertTableWithExampleData();

      editor()
        .click()
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{leftArrow}`);
      
      expectTable(
        row(cellWithText('bar')),
        row(cellWithText('quux'))
      );

      editor()
        .click()
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{upArrow}`)

      expectTable(
        row(cellWithText('quux'))
      );

      editor()
        .click()
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{upArrow}`)

      expectTableToBeDeleted();

      // Undo 3x... let's make sure we can do the same thing,
      // but with reversed order column/row deletion
      editor()
        .type(`{${mod}}z`)
        .type(`{${mod}}z`)
        .type(`{${mod}}z`)
      
      editor()
        .type(`{upArrow}`)
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{upArrow}`);
      
      expectTable(
        row(
          cellWithText('baz'),
          cellWithText('quux'),
        ),
      );
  
      editor()
        .click()
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{leftArrow}`)

      expectTable(
        row(cellWithText('baz'))
      );

      editor()
        .click()
        .type(`{upArrow}`)
        .wait(100)
        .type(`{${mod}}{leftArrow}`)

      expectTableToBeDeleted();
    });
  });
});
