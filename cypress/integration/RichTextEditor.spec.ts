import { MARKS, BLOCKS, INLINES } from '@contentful/rich-text-types';
import {
  document as doc,
  block,
  inline,
  text,
} from '../../packages/rich-text/src/helpers/nodeFactory';

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

  // FIXME: tests are flaky
  describe.skip('Marks', () => {
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
    const insertTable = () => editor().type(`{${mod}}{,}`);
    const insertTableWithExampleData = () => {
      insertTable()
        .typeInSlate('foo')
        .type('{rightArrow}')
        .typeInSlate('bar')
        .type('{rightArrow}')
        .typeInSlate('baz')
        .type('{rightArrow}')
        .typeInSlate('quux');
    };
    const expectDocumentStructure = (...elements) => {
      cy.wait(100);
      expectRichTextFieldValue(doc(emptyParagraph(), ...elements, emptyParagraph()));
    };
    const expectTable = (...tableElements) => expectDocumentStructure(table(...tableElements));
    const expectTableToBeDeleted = () => expectDocumentStructure();

    it('disables block element toolbar buttons when selected', () => {
      insertTable();

      const blockElements = ['quote', 'ul', 'ol', 'hr', 'table'];

      blockElements.forEach((el) => {
        cy.findByTestId(`${el}-toolbar-button`).should('be.disabled');
      });

      getDropdownToolbarButton().click();
      [
        BLOCKS.PARAGRAPH,
        BLOCKS.HEADING_1,
        BLOCKS.HEADING_2,
        BLOCKS.HEADING_3,
        BLOCKS.HEADING_4,
        BLOCKS.HEADING_5,
        BLOCKS.HEADING_6,
      ].map((type) => getDropdownItem(type).get('button').should('be.disabled'));

      // select outside the table
      editor().click().type('{downArrow}').wait(100);

      cy.findByTestId('quote-toolbar-button').should('not.be.disabled');
      cy.findByTestId('ul-toolbar-button').should('not.be.disabled');
      cy.findByTestId('ol-toolbar-button').should('not.be.disabled');
      cy.findByTestId('list-toolbar-button').should('not.be.disabled');

      getDropdownToolbarButton().click();
      [
        BLOCKS.PARAGRAPH,
        BLOCKS.HEADING_1,
        BLOCKS.HEADING_2,
        BLOCKS.HEADING_3,
        BLOCKS.HEADING_4,
        BLOCKS.HEADING_5,
        BLOCKS.HEADING_6,
      ].map((type) => getDropdownItem(type).get('button').should('not.be.disabled'));
    });

    describe('Table Actions', () => {
      const doAction = (action: string) => {
        cy.findByTestId('cf-table-actions').find('button').click();
        cy.findByText(action).click();
      };

      beforeEach(() => {
        insertTableWithExampleData();
      });

      it('adds row above', () => {
        doAction('Add row above');

        expectTable(
          row(cellWithText('foo'), cellWithText('bar')),
          row(emptyCell(), emptyCell()),
          row(cellWithText('baz'), cellWithText('quux'))
        );
      });

      it('adds row below', () => {
        doAction('Add row below');

        expectTable(
          row(cellWithText('foo'), cellWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux')),
          row(emptyCell(), emptyCell())
        );
      });

      it('adds column left', () => {
        doAction('Add column left');

        expectTable(
          row(cellWithText('foo'), emptyCell(), cellWithText('bar')),
          row(cellWithText('baz'), emptyCell(), cellWithText('quux'))
        );
      });

      it('adds column right', () => {
        doAction('Add column right');

        expectTable(
          row(cellWithText('foo'), cellWithText('bar'), emptyCell()),
          row(cellWithText('baz'), cellWithText('quux'), emptyCell())
        );
      });

      it('deletes row', () => {
        doAction('Delete row');

        expectTable(row(cellWithText('foo'), cellWithText('bar')));
      });

      it('deletes column', () => {
        doAction('Delete column');

        expectTable(row(cellWithText('foo')), row(cellWithText('baz')));
      });

      it('deletes table', () => {
        doAction('Delete table');

        expectTableToBeDeleted();
      });
    });
  });

  describe('Links', () => {
    const getLinkTextInput = () => cy.findByTestId('link-text-input');
    const getLinkTypeSelect = () => cy.findByTestId('link-type-input');
    const getLinkTargetInput = () => cy.findByTestId('link-target-input');
    const getSubmitButton = () => cy.findByTestId('confirm-cta');
    const getEntityTextLink = () => cy.findByTestId('cf-ui-form').findByTestId('cf-ui-text-link');
    const expectDocumentStructure = (...nodes) => {
      expectRichTextFieldValue(
        doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            ...nodes.map(([nodeType, ...content]) => {
              if (nodeType === 'text') return text(...content);
              const [data, textContent] = content;
              return inline(nodeType, data, text(textContent));
            })
          )
        )
      );
    };

    const methods: [string, () => void][] = [
      [
        'using the link toolbar button',
        () => {
          cy.findByTestId('hyperlink-toolbar-button').click();
          cy.wait(100);
        },
      ],
      [
        'using the link keyboard shortcut',
        () => {
          editor().type(`{${mod}}k`);
          cy.wait(100);
        },
      ],
    ];

    for (const [triggerMethod, triggerLinkModal] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes hyperlinks', () => {
          editor().click().typeInSlate('The quick brown fox jumps over the lazy ');

          cy.wait(500);

          triggerLinkModal();

          getSubmitButton().should('be.disabled');
          getLinkTextInput().type('dog');
          getSubmitButton().should('be.disabled');
          getLinkTargetInput().type('https://zombo.com');
          getSubmitButton().should('not.be.disabled');
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', 'The quick brown fox jumps over the lazy '],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'dog'],
            ['text', '']
          );

          editor().click().type('{selectall}');
          // TODO: This should just be
          // ```
          // triggerLinkModal();
          // ``
          // but with the keyboard shortcut, this causes an error in Cypress I
          // haven't been able to replicate in the editor. As it's not
          // replicable in "normal" usage we use the toolbar button both places
          // in this test.
          cy.findByTestId('hyperlink-toolbar-button').click();

          cy.wait(100);

          expectDocumentStructure(
            // TODO: the editor should normalize this
            ['text', 'The quick brown fox jumps over the lazy '],
            ['text', 'dog']
          );
        });

        it('converts text to URL hyperlink', () => {
          editor().click().typeInSlate('My cool website').click().type('{selectall}');

          cy.wait(500);

          triggerLinkModal();

          getLinkTextInput().should('have.value', 'My cool website');
          getLinkTypeSelect().should('have.value', 'hyperlink');
          getSubmitButton().should('be.disabled');
          getLinkTargetInput().type('https://zombo.com');
          getSubmitButton().should('not.be.disabled');
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
            ['text', '']
          );
        });

        it('converts text to entry hyperlink', () => {
          editor().click().typeInSlate('My cool entry').click().type('{selectall}');

          cy.wait(500);

          triggerLinkModal();

          getLinkTextInput().should('have.value', 'My cool entry');
          getSubmitButton().should('be.disabled');
          getLinkTypeSelect().should('have.value', 'hyperlink').select('entry-hyperlink');
          getSubmitButton().should('be.disabled');
          cy.findByTestId('cf-ui-entry-card').should('not.exist');
          getEntityTextLink().should('have.text', 'Select entry').click();
          cy.findByTestId('cf-ui-entry-card').should('exist');
          getEntityTextLink().should('have.text', 'Remove selection').click();
          cy.findByTestId('cf-ui-entry-card').should('not.exist');
          getEntityTextLink().should('have.text', 'Select entry').click();
          cy.findByTestId('cf-ui-entry-card').should('exist');
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ENTRY_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Entry' } } },
              'My cool entry',
            ],
            ['text', '']
          );
        });

        it('converts text to asset hyperlink', () => {
          editor().click().typeInSlate('My cool asset').click().type('{selectall}');

          cy.wait(500);

          triggerLinkModal();

          getLinkTextInput().should('have.value', 'My cool asset');
          getSubmitButton().should('be.disabled');
          getLinkTypeSelect().should('have.value', 'hyperlink').select('asset-hyperlink');
          getSubmitButton().should('be.disabled');
          cy.findByTestId('cf-ui-asset-card').should('not.exist');
          getEntityTextLink().should('have.text', 'Select asset').click();
          cy.findByTestId('cf-ui-asset-card').should('exist');
          getEntityTextLink().should('have.text', 'Remove selection').click();
          cy.findByTestId('cf-ui-asset-card').should('not.exist');
          getEntityTextLink().should('have.text', 'Select asset').click();
          cy.findByTestId('cf-ui-asset-card').should('exist');
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ASSET_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Asset' } } },
              'My cool asset',
            ],
            ['text', '']
          );
        });

        it('edits hyperlinks', () => {
          editor().click().typeInSlate('My cool website').click().type('{selectall}');

          cy.wait(500);

          triggerLinkModal();

          // Part 1:
          // Create a hyperlink

          getLinkTextInput().should('have.value', 'My cool website');
          getLinkTargetInput().type('https://zombo.com');
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
            ['text', '']
          );

          // Part 2:
          // Update hyperlink to entry link

          editor()
            .findByTestId('cf-ui-text-link')
            .should('have.text', 'My cool website')
            .click({ force: true });

          getLinkTextInput()
            .should('have.value', 'My cool website')
            .type('{selectall}My cool entry');
          getLinkTypeSelect().should('have.value', 'hyperlink').select('entry-hyperlink');
          getEntityTextLink().should('have.text', 'Select entry').click();
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ENTRY_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Entry' } } },
              'My cool entry',
            ],
            ['text', '']
          );

          // Part 3:
          // Update entry link to asset link

          editor()
            .findByTestId('cf-ui-text-link')
            .should('have.text', 'My cool entry')
            .click({ force: true });

          getLinkTextInput().should('have.value', 'My cool entry').type('{selectall}My cool asset');
          getLinkTypeSelect().should('have.value', 'entry-hyperlink').select('asset-hyperlink');
          getEntityTextLink().should('have.text', 'Select asset').click();
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ASSET_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Asset' } } },
              'My cool asset',
            ],
            ['text', '']
          );

          // Part 3:
          // Update asset link to hyperlink

          editor()
            .findByTestId('cf-ui-text-link')
            .should('have.text', 'My cool asset')
            .click({ force: true });

          getLinkTextInput()
            .should('have.value', 'My cool asset')
            .type('{selectall}My cool website');
          getLinkTypeSelect().should('have.value', 'asset-hyperlink').select('hyperlink');
          getLinkTargetInput().type('https://zombo.com');
          getSubmitButton().click();

          cy.wait(100);

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
            ['text', '']
          );
        });
      });
    }
  });

  describe('Embedded Entry Blocks', () => {
    const methods: [string, () => void][] = [
      [
        'using the toolbar button',
        () => {
          cy.findByTestId('toolbar-entity-dropdown-toggle').click();
          cy.findByTestId('toolbar-toggle-embedded-entry-block').click();
          cy.wait(100);
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          editor().type(`{${mod}}{shift}e`);
          cy.wait(100);
        }
      ]
    ];

    for (const [triggerMethod, triggerEmbeddedEntry] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded entries', () => {
          editor().click();
          triggerEmbeddedEntry();

          cy.wait(500);

          expectRichTextFieldValue(
            doc(
              block(
                BLOCKS.EMBEDDED_ENTRY,
                {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Entry',
                    },
                  },
                },
              ),
              block(BLOCKS.PARAGRAPH, {}, text('')),
            )
          );

          cy.findByTestId('cf-ui-card-actions').findByTestId('cf-ui-icon-button').click();
          cy.findByTestId('delete').click();

          cy.wait(500);

          expectRichTextFieldValue(void 0);
        });

        it('adds embedded entries between words', () => {
          editor()
            .click()
            .typeInSlate('foobar')
            .type('{leftArrow}')
            .type('{leftArrow}')
            .type('{leftArrow}')
            .wait(100);

          triggerEmbeddedEntry();

          cy.wait(100);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('foo')),
              block(
                BLOCKS.EMBEDDED_ENTRY,
                {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Entry',
                    },
                  },
                },
              ),
              block(BLOCKS.PARAGRAPH, {}, text('')), // TODO: ideally we wouldn't have this extra paragraph
              block(BLOCKS.PARAGRAPH, {}, text('bar')),
            )
          );
        });
      });
    }
  });

  describe('Embedded Asset Blocks', () => {
    const methods: [string, () => void][] = [
      [
        'using the toolbar button',
        () => {
          cy.findByTestId('toolbar-entity-dropdown-toggle').click();
          cy.findByTestId('toolbar-toggle-embedded-asset-block').click();
          cy.wait(100);
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          editor().type(`{${mod}}{shift}a`);
          cy.wait(100);
        }
      ]
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded assets', () => {
          editor().click();
          triggerEmbeddedAsset();

          cy.wait(500);

          expectRichTextFieldValue(
            doc(
              block(
                BLOCKS.EMBEDDED_ASSET,
                {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Asset',
                    },
                  },
                },
              ),
              block(BLOCKS.PARAGRAPH, {}, text('')),
            )
          );

          cy.findByTestId('cf-ui-card-actions').findByTestId('cf-ui-icon-button').click();
          cy.findByTestId('card-action-remove').click();

          cy.wait(500);

          expectRichTextFieldValue(void 0);
        });

        it('adds embedded assets between words', () => {
          editor()
            .click()
            .typeInSlate('foobar')
            .type('{leftArrow}')
            .type('{leftArrow}')
            .type('{leftArrow}')
            .wait(100);

          triggerEmbeddedAsset();

          cy.wait(100);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('foo')),
              block(
                BLOCKS.EMBEDDED_ASSET,
                {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Asset',
                    },
                  },
                },
              ),
              block(BLOCKS.PARAGRAPH, {}, text('')), // TODO: ideally we wouldn't have this extra paragraph
              block(BLOCKS.PARAGRAPH, {}, text('bar')),
            )
          );
        });
      });
    }
  });

  describe('Embedded Entry Inlines', () => {
    const methods: [string, () => void][] = [
      [
        'using the toolbar button',
        () => {
          cy.findByTestId('toolbar-entity-dropdown-toggle').click();
          cy.findByTestId('toolbar-toggle-embedded-entry-inline').click();
          cy.wait(100);
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          editor().type(`{${mod}}{shift}2`);
          cy.wait(100);
        }
      ]
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded entries', () => {
          editor().click().typeInSlate('hello')
          triggerEmbeddedAsset();
          editor().click().typeInSlate('world')

          cy.wait(500);

          expectRichTextFieldValue(
            doc(
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('hello'),
                inline(
                  INLINES.EMBEDDED_ENTRY,
                  {
                    target: {
                      sys: {
                        id: 'example-entity-id',
                        type: 'Link',
                        linkType: 'Entry',
                      },
                    },
                  },
                ),
                text('world')),
            )
          );

          cy.findByTestId('cf-ui-card-actions').findByTestId('cf-ui-icon-button').click();
          cy.findByTestId('card-action-remove').click();

          cy.wait(500);

          expectRichTextFieldValue(
            doc(
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('hello'),
                text('world')
              ),
            )
          );

          // TODO: we should also test deletion via {backspace},
          // but this breaks in cypress even though it works in the editor
        });
      });
    }
  });
});
