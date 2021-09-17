import { MARKS, BLOCKS, INLINES } from '@contentful/rich-text-types';
import {
  document as doc,
  block,
  inline,
  text,
} from '../../packages/rich-text/src/helpers/nodeFactory';

function expectRichTextFieldValue(expectedValue, editorEvents?) {
  cy.getRichTextField().should((field) => {
    expect(field.getValue()).to.deep.equal(expectedValue);
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
  const buildHelper =
    (type) =>
    (...children) =>
      block(type, {}, ...children);
  const paragraph = buildHelper(BLOCKS.PARAGRAPH);
  const paragraphWithText = (t) => paragraph(text(t, []));
  const emptyParagraph = () => paragraphWithText('');

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

  function getQuoteToolbarButton() {
    return cy.findByTestId('quote-toolbar-button');
  }

  function addBlockquote(content = '') {
    editor().click().type(content);

    getQuoteToolbarButton().click();

    const expectedValue = doc(
      block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text(content, []))),
      block(BLOCKS.PARAGRAPH, {}, text('', []))
    );

    expectRichTextFieldValue(expectedValue);

    return expectedValue;
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
    editor().click().type('some text').click();

    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text')));

    expectRichTextFieldValue(expectedValue);
  });

  it('supports undo and redo', () => {
    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text.')));

    // type
    editor().click().type('some text.').click();

    expectRichTextFieldValue(expectedValue, { id: 21, type: 'setValue' });

    // undo
    editor().click().type(`{${mod}}z`).click();
    expectRichTextFieldValue(undefined, { id: 24, type: 'removeValue' });

    // redo
    editor().click().type(`{${mod}}{shift}z`).click();
    expectRichTextFieldValue(expectedValue, { id: 27, type: 'setValue' });
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

          editor().type('some text');

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          editor().click().type('some text{selectall}');

          toggleMarkViaToolbar();

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          editor().click();

          toggleMarkViaToolbar();
          toggleMarkViaToolbar();

          editor().type('some text');

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          editor().click().type('some text{selectall}');

          toggleMarkViaToolbar();

          cy.wait(100);

          editor().click().type('{selectall}');

          toggleMarkViaToolbar();

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          expectRichTextFieldValue(expectedValue);
        });
      });

      describe(`${mark} mark toggle via shortcut`, () => {
        it('allows writing marked text', () => {
          editor().click().type(shortcut).type('some text');

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          editor().click().type('some text');

          cy.wait(100);

          editor().type('{selectall}').type(shortcut);

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          editor().click().type(shortcut).type(shortcut).type('some text');

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          expectRichTextFieldValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          editor().click().type('some text');

          cy.wait(100);

          editor().type('{selectall}').type(shortcut).type('{selectall}').type(shortcut);

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
        editor().click().type('some text');

        getHrToolbarButton().click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should end with an empty paragraph', () => {
        editor().click().type('some text');

        getHrToolbarButton().click();
        getHrToolbarButton().click();
        getHrToolbarButton().click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should unwrap blockquote', () => {
        addBlockquote('some text');

        getHrToolbarButton().click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );
        expectRichTextFieldValue(expectedValue);
      });

      it.skip('should add line if HR is the first void block', () => {
        editor().click();

        getHrToolbarButton().click();

        // Not necessary for the test but here to "force" waiting until
        // we have the expected document structure
        expectRichTextFieldValue(
          doc(block(BLOCKS.HR, {}), block(BLOCKS.PARAGRAPH, {}, text('', [])))
        );

        // Move arrow up to select the HR then press ENTER
        editor().click().type('{uparrow}{enter}');

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('', [])),
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
      [BLOCKS.HEADING_1, 'Heading 1', `{${mod}+alt+1}`],
      [BLOCKS.HEADING_2, 'Heading 2', `{${mod}+alt+2}`],
      [BLOCKS.HEADING_3, 'Heading 3', `{${mod}+alt+3}`],
      [BLOCKS.HEADING_4, 'Heading 4', `{${mod}+alt+4}`],
      [BLOCKS.HEADING_5, 'Heading 5', `{${mod}+alt+5}`],
      [BLOCKS.HEADING_6, 'Heading 6', `{${mod}+alt+6}`],
    ];

    headings.forEach(([type, label, shortcut]) => {
      describe(label, () => {
        it(`allows typing ${label} (${type})`, () => {
          editor().click().type('some text');

          getDropdownToolbarButton().click();
          getDropdownItem(type).click();

          // Account for trailing paragraph
          const expectedValue =
            type === BLOCKS.PARAGRAPH
              ? doc(block(type, {}, text('some text', [])))
              : doc(block(type, {}, text('some text', [])), emptyParagraph());

          expectRichTextFieldValue(expectedValue);
        });

        if (shortcut) {
          it(`allows writing ${label} (${type}) via hotkeys ${shortcut}`, () => {
            editor().click().type(shortcut).type('some text');

            const expectedValue = doc(block(type, {}, text('some text', [])), emptyParagraph());

            expectRichTextFieldValue(expectedValue);
          });
        }

        it(`should set the dropdown label to ${label}`, () => {
          editor().click().type('some text');

          getDropdownToolbarButton().click();
          getDropdownItem(type).click();

          getDropdownToolbarButton().should('have.text', label);
        });

        // TODO: Move this test to either a single test with multiple assertions or for only one heading type due to performance
        if (type !== BLOCKS.PARAGRAPH) {
          it('should unwrap blockquote', () => {
            addBlockquote('some text');

            getDropdownToolbarButton().click();
            getDropdownItem(type).click();

            const expectedHeadingValue = doc(
              block(type, {}, text('some text', [])),
              block(BLOCKS.PARAGRAPH, {}, text('', []))
            );

            expectRichTextFieldValue(expectedHeadingValue);
          });
        } else {
          it('should not unwrap blockquote', () => {
            const expectedQuoteValue = addBlockquote('some text');

            getDropdownToolbarButton().click();
            getDropdownItem(type).click();

            expectRichTextFieldValue(expectedQuoteValue);
          });
        }
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
      it('should be visible', () => {
        getQuoteToolbarButton().should('be.visible');
      });

      it('should add a block quote when clicking followed by a trailing empty paragraph', () => {
        editor().click();

        getQuoteToolbarButton().click();

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should convert existing paragraph into a block quote', () => {
        editor().click().type('some text');

        getQuoteToolbarButton().click();

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should convert block quote back to paragraph', () => {
        editor().click().type('some text');

        getQuoteToolbarButton().click();
        getQuoteToolbarButton().click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        expectRichTextFieldValue(expectedValue);
      });

      it('should add multi-paragraph block quotes', () => {
        editor().click().type('paragraph 1');

        getQuoteToolbarButton().click();

        editor().type('{enter}').type('paragraph 2');

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
          editor().type('item 1');

          const expectedValue = doc(
            block(
              test.listType,
              {},
              block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item 1', [])))
            ),
            emptyParagraph()
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('should untoggle the list', () => {
          editor().click();

          test.getList().click();

          editor().type('some text');

          test.getList().click();

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
            emptyParagraph()
          );

          expectRichTextFieldValue(expectedValue);
        });

        it('should unwrap blockquote', () => {
          addBlockquote('some text');

          test.getList().click();

          const expectedValue = doc(
            block(
              test.listType,
              {},
              block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', [])))
            ),
            emptyParagraph()
          );

          expectRichTextFieldValue(expectedValue);
        });
      });
    });
  });

  describe('New Line', () => {
    it('should add a new line on a paragraph', () => {
      editor()
        .click()
        .type('some text 1')
        .type('{shift+enter}')
        .type('some text 2')
        .type('{shift+enter}')
        .type('some text 3');

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
        .type('some text 1')
        .type('{shift+enter}')
        .type('some text 2')
        .type('{shift+enter}')
        .type('some text 3');

      const expectedValue = doc(
        block(BLOCKS.HEADING_1, {}, text('some text 1\nsome text 2\nsome text 3')),
        emptyParagraph()
      );

      expectRichTextFieldValue(expectedValue);
    });

    it('should add a new line on a list', () => {
      editor().click();

      getUlToolbarButton().click();

      editor()
        .type('some text 1')
        .type('{shift+enter}')
        .type('some text 2')
        .type('{shift+enter}')
        .type('some text 3');

      const expectedValue = doc(
        block(
          BLOCKS.UL_LIST,
          {},
          block(
            BLOCKS.LIST_ITEM,
            {},
            block(BLOCKS.PARAGRAPH, {}, text('some text 1\nsome text 2\nsome text 3', []))
          )
        ),
        emptyParagraph()
      );

      expectRichTextFieldValue(expectedValue);
    });
  });

  describe('Tables', () => {
    const table = buildHelper(BLOCKS.TABLE);
    const row = buildHelper(BLOCKS.TABLE_ROW);
    const cell = buildHelper(BLOCKS.TABLE_CELL);
    const header = buildHelper(BLOCKS.TABLE_HEADER_CELL);
    const emptyCell = () => cell(emptyParagraph());
    const emptyHeader = () => header(emptyParagraph());
    const cellWithText = (t) => cell(paragraphWithText(t));
    const headerWithText = (t) => header(paragraphWithText(t));
    const insertTable = () => {
      editor().click();
      cy.findByTestId('table-toolbar-button').click();
      return editor();
    };
    const insertTableWithExampleData = () => {
      insertTable()
        .type('foo')
        .type('{rightarrow}')
        .type('bar')
        .type('{rightarrow}')
        .type('baz')
        .type('{rightarrow}')
        .type('quux');
    };
    const expectDocumentStructure = (...elements) => {
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
      editor().click().type('{downarrow}').wait(100);

      blockElements.forEach((el) => {
        cy.findByTestId(`${el}-toolbar-button`).should('not.be.disabled');
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
      ].map((type) => getDropdownItem(type).get('button').should('not.be.disabled'));
    });

    describe('Table Actions', () => {
      const findAction = (action: string) => {
        cy.findByTestId('cf-table-actions').find('button').click();
        return cy.findByText(action);
      };

      const doAction = (action: string) => {
        findAction(action).click();
      };

      beforeEach(() => {
        insertTableWithExampleData();
      });

      describe('adds row above', () => {
        it('with table header cell', () => {
          // Delete the table that was added in the beforeEach clause
          // because we need the focus to be on the first row
          doAction('Delete table');

          // Insert an empty table (focus is on first row by default)
          insertTable();

          findAction('Add row above').parent().should('be.disabled');
        });

        it('with table cell', () => {
          doAction('Add row above');

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(emptyCell(), emptyCell()),
            row(cellWithText('baz'), cellWithText('quux'))
          );
        });
      });

      it('adds row below', () => {
        doAction('Add row below');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux')),
          row(emptyCell(), emptyCell())
        );
      });

      it('adds column left', () => {
        doAction('Add column left');

        expectTable(
          row(headerWithText('foo'), emptyHeader(), headerWithText('bar')),
          row(cellWithText('baz'), emptyCell(), cellWithText('quux'))
        );
      });

      it('adds column right', () => {
        doAction('Add column right');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar'), emptyHeader()),
          row(cellWithText('baz'), cellWithText('quux'), emptyCell())
        );
      });

      it('enables/disables table header', () => {
        doAction('Disable table header');

        expectTable(
          row(cellWithText('foo'), cellWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux'))
        );

        doAction('Enable table header');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux'))
        );
      });

      it('deletes row', () => {
        doAction('Delete row');

        expectTable(row(headerWithText('foo'), headerWithText('bar')));
      });

      it('deletes column', () => {
        doAction('Delete column');

        expectTable(row(headerWithText('foo')), row(cellWithText('baz')));
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

    // Type and wait for the text to be persisted
    const safelyType = (text: string) => {
      editor().type(text);

      expectDocumentStructure(['text', text.replace('{selectall}', '')]);
    };

    const methods: [string, () => void][] = [
      [
        'using the link toolbar button',
        () => {
          cy.findByTestId('hyperlink-toolbar-button').click();
        },
      ],
      [
        'using the link keyboard shortcut',
        () => {
          editor().type(`{${mod}}k`);
        },
      ],
    ];

    for (const [triggerMethod, triggerLinkModal] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes hyperlinks', () => {
          safelyType('The quick brown fox jumps over the lazy ');

          triggerLinkModal();

          getSubmitButton().should('be.disabled');
          getLinkTextInput().type('dog');
          getSubmitButton().should('be.disabled');
          getLinkTargetInput().type('https://zombo.com');
          getSubmitButton().should('not.be.disabled');
          getSubmitButton().click();

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

          expectDocumentStructure(
            // TODO: the editor should normalize this
            ['text', 'The quick brown fox jumps over the lazy '],
            ['text', 'dog']
          );
        });

        it('converts text to URL hyperlink', () => {
          safelyType('My cool website{selectall}');

          triggerLinkModal();

          getLinkTextInput().should('have.value', 'My cool website');
          getLinkTypeSelect().should('have.value', 'hyperlink');
          getSubmitButton().should('be.disabled');
          getLinkTargetInput().type('https://zombo.com');
          getSubmitButton().should('not.be.disabled');
          getSubmitButton().click();

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
            ['text', '']
          );
        });

        it('converts text to entry hyperlink', () => {
          safelyType('My cool entry{selectall}');
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
          safelyType('My cool asset{selectall}');

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
          safelyType('My cool website{selectall}');

          triggerLinkModal();

          // Part 1:
          // Create a hyperlink

          getLinkTextInput().should('have.value', 'My cool website');
          getLinkTargetInput().type('https://zombo.com');
          getSubmitButton().click();

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
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          editor().type(`{${mod}+shift+e}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedEntry] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded entries', () => {
          editor().click().then(triggerEmbeddedEntry);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.EMBEDDED_ENTRY, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Entry',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text(''))
            )
          );

          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('delete').click();

          expectRichTextFieldValue(undefined);
        });

        it('adds and removes embedded entries by selecting and pressing `backspace`', () => {
          editor().click().then(triggerEmbeddedEntry);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.EMBEDDED_ENTRY, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Entry',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text(''))
            )
          );

          cy.findByTestId('cf-ui-entry-card').click();
          // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
          editor().trigger('keydown', { keyCode: 8, which: 8, key: 'Backspace' }); // 8 = delete/backspace

          expectRichTextFieldValue(undefined);
        });

        it('adds embedded entries between words', () => {
          editor()
            .click()
            .type('foobar{leftarrow}{leftarrow}{leftarrow}')
            .then(triggerEmbeddedEntry);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('foo')),
              block(BLOCKS.EMBEDDED_ENTRY, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Entry',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text('bar'))
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
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          editor().type(`{${mod}+shift+a}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded assets', () => {
          editor().click().then(triggerEmbeddedAsset);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.EMBEDDED_ASSET, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Asset',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text(''))
            )
          );

          cy.findByTestId('cf-ui-card-actions').findByTestId('cf-ui-icon-button').click();
          cy.findByTestId('card-action-remove').click();

          expectRichTextFieldValue(undefined);
        });

        it('adds and removes embedded assets by selecting and pressing `backspace`', () => {
          editor().click().then(triggerEmbeddedAsset);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.EMBEDDED_ASSET, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Asset',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text(''))
            )
          );

          cy.findByTestId('cf-ui-asset-card').click();
          // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
          editor().trigger('keydown', { keyCode: 8, which: 8, key: 'Backspace' }); // 8 = delete/backspace

          expectRichTextFieldValue(undefined);
        });

        it('adds embedded assets between words', () => {
          editor()
            .click()
            .type('foobar{leftarrow}{leftarrow}{leftarrow}')
            .then(triggerEmbeddedAsset);

          expectRichTextFieldValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('foo')),
              block(BLOCKS.EMBEDDED_ASSET, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Asset',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text('bar'))
            )
          );
        });
      });
    }
  });

  describe('Embedded Entry Inlines', () => {
    const methods: [string, () => Cypress.Chainable<any>][] = [
      [
        'using the toolbar button',
        () => {
          cy.findByTestId('toolbar-entity-dropdown-toggle').click();
          return cy.findByTestId('toolbar-toggle-embedded-entry-inline').click();
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          return editor().type(`{${mod}+shift+2}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded entries', () => {
          editor()
            .click()
            .type('hello')
            .then(triggerEmbeddedAsset)
            .then(() => {
              editor().click().type('world');
            });

          expectRichTextFieldValue(
            doc(
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('hello'),
                inline(INLINES.EMBEDDED_ENTRY, {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Entry',
                    },
                  },
                }),
                text('world')
              )
            )
          );

          cy.findByTestId('cf-ui-card-actions').findByTestId('cf-ui-icon-button').click();
          cy.findByTestId('card-action-remove').click();

          expectRichTextFieldValue(doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), text('world'))));

          // TODO: we should also test deletion via {backspace},
          // but this breaks in cypress even though it works in the editor
        });
      });
    }
  });
});
