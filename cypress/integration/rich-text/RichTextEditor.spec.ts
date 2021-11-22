import { MARKS, BLOCKS, INLINES } from '@contentful/rich-text-types';
import {
  document as doc,
  block,
  inline,
  text,
} from '../../../packages/rich-text/src/helpers/nodeFactory';

import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

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
  const expectDocumentToBeEmpty = () => richText.expectValue(undefined);

  const keys = {
    enter: { keyCode: 13, which: 13, key: 'Enter' },
    rightArrow: { keyCode: 39, which: 39, key: 'ArrowRight' },
    backspace: { keyCode: 8, which: 8, key: 'Backspace' },
  };

  function getDropdownToolbarButton() {
    return cy.findByTestId('toolbar-heading-toggle');
  }

  function getDropdownList() {
    return cy.findByTestId('dropdown-heading-list');
  }

  function getDropdownItem(type: string) {
    return cy.findByTestId(`dropdown-option-${type}`);
  }

  function clickDropdownItem(type: string) {
    getDropdownToolbarButton().click();
    getDropdownItem(type).click({ force: true });
  }

  function addBlockquote(content = '') {
    richText.editor.click().type(content);

    richText.toolbar.quote.click();

    const expectedValue = doc(
      block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text(content, []))),
      block(BLOCKS.PARAGRAPH, {}, text('', []))
    );

    richText.expectValue(expectedValue);

    return expectedValue;
  }

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  it('is empty by default', () => {
    cy.editorEvents().should('deep.equal', []);
  });

  it('allows typing', () => {
    richText.editor.click().type('some text').click();

    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text')));

    richText.expectValue(expectedValue);
  });

  it('supports undo and redo', () => {
    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text.')));

    // type
    richText.editor.click().type('some text.').click();

    richText.expectValue(expectedValue, { id: 21, type: 'setValue' });

    // undo
    richText.editor.click().type(`{${mod}}z`).click();
    richText.expectValue(undefined, { id: 24, type: 'removeValue' });

    // redo
    richText.editor.click().type(`{${mod}}{shift}z`).click();
    richText.expectValue(expectedValue, { id: 27, type: 'setValue' });
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
          richText.editor.click();

          toggleMarkViaToolbar();

          richText.editor.type('some text');

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          richText.editor.click().type('some text{selectall}');

          toggleMarkViaToolbar();

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          richText.editor.click();

          toggleMarkViaToolbar();
          toggleMarkViaToolbar();

          richText.editor.type('some text');

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          richText.editor.click().type('some text{selectall}');

          toggleMarkViaToolbar();

          cy.wait(100);

          richText.editor.click().type('{selectall}');

          toggleMarkViaToolbar();

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });
      });

      describe(`${mark} mark toggle via shortcut`, () => {
        it('allows writing marked text', () => {
          richText.editor.click().type(shortcut).type('some text');

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          richText.editor.click().type('some text');

          cy.wait(100);

          richText.editor.type('{selectall}').type(shortcut);

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          richText.editor.click().type(shortcut).type(shortcut).type('some text');

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          richText.editor.click().type('some text');

          cy.wait(100);

          richText.editor.type('{selectall}').type(shortcut).type('{selectall}').type(shortcut);

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });
      });
    });
  });

  describe('HR', () => {
    describe('toolbar button', () => {
      it('should be visible', () => {
        richText.toolbar.hr.should('be.visible');
      });

      it('should add a new line when clicking', () => {
        richText.editor.click().type('some text');

        richText.toolbar.hr.click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should end with an empty paragraph', () => {
        richText.editor.click().type('some text');

        richText.toolbar.hr.click();
        richText.toolbar.hr.click();
        richText.toolbar.hr.click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should unwrap blockquote', () => {
        addBlockquote('some text');

        richText.toolbar.hr.click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );
        richText.expectValue(expectedValue);
      });

      it.skip('should add line if HR is the first void block', () => {
        richText.editor.click();

        richText.toolbar.hr.click();

        // Not necessary for the test but here to "force" waiting until
        // we have the expected document structure
        richText.expectValue(doc(block(BLOCKS.HR, {}), block(BLOCKS.PARAGRAPH, {}, text('', []))));

        // Move arrow up to select the HR then press ENTER
        richText.editor.click().type('{uparrow}{enter}');

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
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
          richText.editor.click().type('some text');

          clickDropdownItem(type);

          // TODO: We should somehow assert that the editor is focused after this.

          // Account for trailing paragraph
          const expectedValue =
            type === BLOCKS.PARAGRAPH
              ? doc(block(type, {}, text('some text', [])))
              : doc(block(type, {}, text('some text', [])), emptyParagraph());

          richText.expectValue(expectedValue);
        });

        if (shortcut) {
          it(`allows writing ${label} (${type}) via hotkeys ${shortcut}`, () => {
            richText.editor.click().type(shortcut).type('some text');

            const expectedValue = doc(block(type, {}, text('some text', [])), emptyParagraph());

            richText.expectValue(expectedValue);
          });
        }

        it(`should set the dropdown label to ${label}`, () => {
          richText.editor.click().type('some text');

          clickDropdownItem(type);

          getDropdownToolbarButton().should('have.text', label);
        });

        // TODO: Move this test to either a single test with multiple assertions or for only one heading type due to performance
        if (type !== BLOCKS.PARAGRAPH) {
          it('should unwrap blockquote', () => {
            addBlockquote('some text');

            clickDropdownItem(type);

            const expectedHeadingValue = doc(
              block(type, {}, text('some text', [])),
              block(BLOCKS.PARAGRAPH, {}, text('', []))
            );

            richText.expectValue(expectedHeadingValue);
          });
        } else {
          it('should not unwrap blockquote', () => {
            const expectedQuoteValue = addBlockquote('some text');

            clickDropdownItem(type);

            richText.expectValue(expectedQuoteValue);
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
        richText.toolbar.quote.should('be.visible');
      });

      it('should add a block quote when clicking followed by a trailing empty paragraph', () => {
        richText.editor.click();

        richText.toolbar.quote.click();

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should convert existing paragraph into a block quote', () => {
        richText.editor.click().type('some text');

        richText.toolbar.quote.click();

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should convert block quote back to paragraph', () => {
        richText.editor.click().type('some text');

        richText.toolbar.quote.click();
        richText.toolbar.quote.click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should add multi-paragraph block quotes', () => {
        richText.editor.click().type('paragraph 1');

        richText.toolbar.quote.click();

        richText.editor.type('{enter}').type('paragraph 2');

        const expectedValue = doc(
          block(
            BLOCKS.QUOTE,
            {},
            block(BLOCKS.PARAGRAPH, {}, text('paragraph 1', [])),
            block(BLOCKS.PARAGRAPH, {}, text('paragraph 2', []))
          ),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });
    });
  });

  describe('Lists', () => {
    const lists = [
      {
        getList: () => richText.toolbar.ul,
        listType: BLOCKS.UL_LIST,
        label: 'Unordered List (UL)',
      },
      { getList: () => richText.toolbar.ol, listType: BLOCKS.OL_LIST, label: 'Ordered List (OL)' },
    ];

    lists.forEach((test) => {
      describe(test.label, () => {
        it('should be visible', () => {
          test.getList().should('be.visible');
        });

        it('should add a new list', () => {
          richText.editor.click();

          test.getList().click();
          // TODO: Find a way to test deeper lists
          /*
            Having issues with `.type('{enter})` to break lines.
            The error is:
            Cannot resolve a Slate node from DOM node: [object HTMLSpanElement]
          */
          richText.editor.type('item 1');

          const expectedValue = doc(
            block(
              test.listType,
              {},
              block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item 1', [])))
            ),
            emptyParagraph()
          );

          richText.expectValue(expectedValue);
        });

        it('should untoggle the list', () => {
          richText.editor.click();

          test.getList().click();

          richText.editor.type('some text');

          test.getList().click();

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
            emptyParagraph()
          );

          richText.expectValue(expectedValue);
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

          richText.expectValue(expectedValue);
        });
      });
    });
  });

  describe('New Line', () => {
    it('should add a new line on a paragraph', () => {
      richText.editor
        .click()
        .type('some text 1')
        .type('{shift+enter}')
        .type('some text 2')
        .type('{shift+enter}')
        .type('some text 3');

      const expectedValue = doc(
        block(BLOCKS.PARAGRAPH, {}, text('some text 1\nsome text 2\nsome text 3'))
      );

      richText.expectValue(expectedValue);
    });

    it('should add a new line on a heading', () => {
      richText.editor.click();

      clickDropdownItem(BLOCKS.HEADING_1);

      richText.editor
        .type('some text 1')
        .type('{shift+enter}')
        .type('some text 2')
        .type('{shift+enter}')
        .type('some text 3');

      const expectedValue = doc(
        block(BLOCKS.HEADING_1, {}, text('some text 1\nsome text 2\nsome text 3')),
        emptyParagraph()
      );

      richText.expectValue(expectedValue);
    });

    it('should add a new line on a list', () => {
      richText.editor.click();

      richText.toolbar.ul.click();

      richText.editor
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

      richText.expectValue(expectedValue);
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
      richText.editor.click();
      richText.toolbar.table.click();
      return richText.editor;
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
      richText.expectValue(doc(...elements, emptyParagraph()));
    };
    const expectTable = (...tableElements) => expectDocumentStructure(table(...tableElements));

    it('disables block element toolbar buttons when selected', () => {
      insertTable();

      const blockElements = ['quote', 'ul', 'ol', 'hr', 'table'];

      blockElements.forEach((el) => {
        richText.toolbar[el].should('be.disabled');
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
      richText.editor.click().type('{downarrow}').wait(100);

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

    describe('Inserting Tables', () => {
      it('replaces empty paragraphs with tables', () => {
        insertTable();

        richText.expectValue(
          doc(
            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph()
          )
        );
      });

      it('inserts new table below if paragraph is not empty', () => {
        richText.editor.type('foo');

        insertTable();

        richText.expectValue(
          doc(
            paragraphWithText('foo'),
            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph()
          )
        );
      });

      describe('Toolbar', () => {
        const buttonsToDisableTable = ['quote', 'ul', 'ol'];

        buttonsToDisableTable.forEach((button) => {
          it(`should disable table button on toolbar if ${button} is selected`, () => {
            richText.editor.click();

            cy.findByTestId(`${button}-toolbar-button`).click();

            richText.toolbar.table.should('be.disabled');
          });
        });
      });
    });

    describe('Deleting text', () => {
      describe('Backward deletion', () => {
        it('removes the text, not the cell', () => {
          insertTableWithExampleData();
          cy.get('table > tbody > tr:last-child > td:last-child').click();
          richText.editor
            .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Backspace' }); // 8 = delete/backspace

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), emptyCell())
          );

          // make sure it works for table header cells, too
          cy.get('table > tbody > tr:first-child > th:first-child').click();
          richText.editor
            .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Backspace' }); // 8 = delete/backspace

          expectTable(
            row(emptyHeader(), headerWithText('bar')),
            row(cellWithText('baz'), emptyCell())
          );
        });
      });

      describe('Forward deletion', () => {
        it('removes the text, not the cell', () => {
          insertTableWithExampleData();
          cy.get('table > tbody > tr:first-child > th:first-child').click();
          richText.editor
            .type('{leftarrow}{leftarrow}{leftarrow}{del}{del}{del}{del}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Delete' }) // 8 = delete/backspace
            // try forward-deleting from outside the table for good measure
            .type('{leftarrow}{del}')
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Delete' });
          expectTable(
            row(headerWithText(''), headerWithText('bar')),
            row(cellWithText('baz'), cellWithText('quux'))
          );
        });
      });
    });

    describe('Table Actions', () => {
      const findAction = (action: string) => {
        cy.findByTestId('cf-table-actions-button').click();
        return cy.findByText(action);
      };

      const doAction = (action: string) => {
        findAction(action).click({ force: true });
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

          findAction('Add row above').should('be.disabled');
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

        expectDocumentToBeEmpty();
      });
    });
  });

  describe('Links', () => {
    const getLinkTextInput = () => cy.findByTestId('link-text-input');
    const getLinkTypeSelect = () => cy.findByTestId('link-type-input');
    const getLinkTargetInput = () => cy.findByTestId('link-target-input');
    const getSubmitButton = () => cy.findByTestId('confirm-cta');
    const getEntityTextLink = () => cy.findByTestId('entity-selection-link');
    const expectDocumentStructure = (...nodes) => {
      richText.expectValue(
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
      richText.editor.type(text);

      expectDocumentStructure(['text', text.replace('{selectall}', '')]);
    };

    const methods: [string, () => void][] = [
      [
        'using the link toolbar button',
        () => {
          richText.toolbar.hyperlink.click();
        },
      ],
      [
        'using the link keyboard shortcut',
        () => {
          richText.editor.type(`{${mod}}k`);
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

          richText.editor.click().type('{selectall}');
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

          richText.editor
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

          richText.editor
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

          richText.editor
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
          richText.editor.type(`{${mod}+shift+e}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedEntry] of methods) {
      describe(triggerMethod, () => {
        it('adds paragraph before the block when pressing enter if the block is first document node', () => {
          richText.editor.click().then(triggerEmbeddedEntry);

          richText.editor.find('[data-entity-id="example-entity-id"]').click();

          richText.editor.trigger('keydown', keys.enter);

          richText.expectValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('')),
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
        });

        it('adds paragraph between two blocks when pressing enter', () => {
          function addEmbeddedEntry() {
            richText.editor.click('bottom').then(triggerEmbeddedEntry);
            richText.editor.click().trigger('keydown', keys.rightArrow);
          }

          function selectAndPressEnter() {
            richText.editor.get('[data-entity-id="example-entity-id"]').first().click();
            richText.editor.trigger('keydown', keys.enter);
          }

          addEmbeddedEntry();
          addEmbeddedEntry();
          selectAndPressEnter(); // Inserts paragraph before embed because it's in the first line.
          selectAndPressEnter(); // inserts paragraph in-between embeds.

          richText.expectValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('')),
              block(BLOCKS.EMBEDDED_ENTRY, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Entry',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text('')),
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
        });

        it('adds and removes embedded entries', () => {
          richText.editor.click().then(triggerEmbeddedEntry);

          richText.expectValue(
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
          cy.findByTestId('card-action-remove').click();

          richText.expectValue(undefined);
        });

        it('adds and removes embedded entries by selecting and pressing `backspace`', () => {
          richText.editor.click().then(triggerEmbeddedEntry);

          richText.expectValue(
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
          richText.editor.trigger('keydown', keys.backspace);

          richText.expectValue(undefined);
        });

        it('adds embedded entries between words', () => {
          richText.editor
            .click()
            .type('foobar{leftarrow}{leftarrow}{leftarrow}')
            .then(triggerEmbeddedEntry);

          richText.expectValue(
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
          richText.editor.type(`{${mod}+shift+a}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds paragraph before the block when pressing enter if the block is first document node', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.editor.find('[data-entity-id="example-entity-id"]').click();

          richText.editor.trigger('keydown', keys.enter);

          richText.expectValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('')),
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
        });

        it('adds paragraph between two blocks when pressing enter', () => {
          function addEmbeddedEntry() {
            richText.editor.click('bottom').then(triggerEmbeddedAsset);
            richText.editor.click().trigger('keydown', keys.rightArrow);
          }

          function selectAndPressEnter() {
            richText.editor.click().get('[data-entity-id="example-entity-id"]').first().click();
            richText.editor.trigger('keydown', keys.enter);
          }

          addEmbeddedEntry();
          addEmbeddedEntry();

          selectAndPressEnter();
          selectAndPressEnter();

          richText.expectValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('')),
              block(BLOCKS.EMBEDDED_ASSET, {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Asset',
                  },
                },
              }),
              block(BLOCKS.PARAGRAPH, {}, text('')),
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
        });

        it('adds and removes embedded assets', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.expectValue(
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

          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('card-action-remove').click();

          richText.expectValue(undefined);
        });

        it('adds and removes embedded assets by selecting and pressing `backspace`', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.expectValue(
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
          richText.editor.trigger('keydown', keys.backspace);

          richText.expectValue(undefined);
        });

        it('adds embedded assets between words', () => {
          richText.editor
            .click()
            .type('foobar{leftarrow}{leftarrow}{leftarrow}')
            .then(triggerEmbeddedAsset);

          richText.expectValue(
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
          return richText.editor.type(`{${mod}+shift+2}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded entries', () => {
          richText.editor
            .click()
            .type('hello')
            .then(triggerEmbeddedAsset)
            .then(() => {
              richText.editor.click().type('world');
            });

          richText.expectValue(
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

          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('card-action-remove').click();

          richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), text('world'))));

          // TODO: we should also test deletion via {backspace},
          // but this breaks in cypress even though it works in the editor
        });
      });
    }
  });
});
