/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { getIframe } from '../../fixtures/utils';
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

  function getDropdownItem(type: string) {
    return getIframe().findByTestId(`dropdown-option-${type}`);
  }

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  it('is empty by default', () => {
    cy.editorEvents().should('deep.equal', []);
  });

  it('disable all editor actions on readonly mode', () => {
    cy.setInitialValue(
      doc(
        paragraphWithText('text'),
        block(
          BLOCKS.TABLE,
          {},
          block(
            BLOCKS.TABLE_ROW,
            {},
            block(BLOCKS.TABLE_HEADER_CELL, {}, paragraphWithText('heading 1')),
            block(BLOCKS.TABLE_HEADER_CELL, {}, paragraphWithText('heading 2'))
          ),
          block(
            BLOCKS.TABLE_ROW,
            {},
            block(BLOCKS.TABLE_CELL, {}, paragraphWithText('cell 1')),
            block(BLOCKS.TABLE_CELL, {}, paragraphWithText('cell 2'))
          )
        ),
        emptyParagraph()
      )
    );

    cy.setInitialDisabled(true);

    // Necessary for reading the correct LocalStorage values as we do
    // the initial page load on the beforeEach hook
    cy.reload();

    richText.toolbar.bold.should('be.disabled');
    richText.toolbar.headingsDropdown.should('be.disabled');
    richText.toolbar.hr.should('be.disabled');
    richText.toolbar.hyperlink.should('be.disabled');
    richText.toolbar.italic.should('be.disabled');
    richText.toolbar.ol.should('be.disabled');
    richText.toolbar.quote.should('be.disabled');
    richText.toolbar.table.should('be.disabled');
    richText.toolbar.ul.should('be.disabled');
    richText.toolbar.underline.should('be.disabled');
    richText.toolbar.embedDropdown.should('be.disabled');
  });

  it('allows typing', () => {
    richText.editor.click().type('some text').click();

    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text')));

    richText.expectValue(expectedValue);
  });

  it('has correct keyboard navigation', () => {
    richText.editor.focus();
    richText.editor.tab({ shift: true });
    richText.toolbar.embedDropdown.should('have.focus');
    richText.editor.tab();
    richText.editor.tab();
    richText.editor.should('not.have.focus');
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

    // We know this feature doesn't work on firefox, we skip it
    if (Cypress.browser.family !== 'firefox') {
      it('inserts new line before table', () => {
        // prevent expected error `Cannot resolve a Slate point from DOM point` from failing this test
        Cypress.on('uncaught:exception', (err) => {
          if (
            err.message.includes(
              'Cannot resolve a Slate point from DOM point: [object HTMLDivElement],0'
            )
          ) {
            return false;
          }

          // we still want the test to fail in case there's any other error
          return true;
        });

        insertTable();

        richText.editor.type('{uparrow}{enter}');

        richText.expectValue(
          doc(
            emptyParagraph(),

            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph()
          )
        );
      });
    }

    it('can delete embedded inline entries inside table', () => {
      insertTable();

      richText.editor.type('hey');
      richText.toolbar.embed('entry-inline');
      richText.editor.type('{backspace}{backspace}'); // one selects, the secodnd deletes it

      richText.expectValue(
        doc(
          table(
            row(header(paragraphWithText('hey')), emptyHeader()),
            row(emptyCell(), emptyCell())
          ),
          emptyParagraph()
        )
      );
    });

    it('does not delete table header cells when selecting the whole table', () => {
      insertTable();

      richText.editor.type(`hey{${mod}}a{backspace}`);

      richText.expectValue(
        doc(
          table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
          emptyParagraph()
        )
      );
    });

    it('delete multiple lines inside cells', () => {
      insertTable();

      richText.editor.type('hey{enter}{backspace}');

      richText.expectValue(
        doc(
          table(
            row(header(paragraphWithText('hey')), emptyHeader()),
            row(emptyCell(), emptyCell())
          ),
          emptyParagraph()
        )
      );
    });

    it('disables block element toolbar buttons when selected', () => {
      insertTable();

      const blockElements = ['quote', 'ul', 'ol', 'hr', 'table'];

      blockElements.forEach((el) => {
        richText.toolbar[el].should('be.disabled');
      });

      richText.toolbar.headingsDropdown.should('be.disabled');

      // select outside the table
      richText.editor.click().type('{downarrow}').wait(100);

      blockElements.forEach((el) => {
        getIframe().findByTestId(`${el}-toolbar-button`).should('not.be.disabled');
      });

      richText.toolbar.headingsDropdown.click();
      [
        BLOCKS.PARAGRAPH,
        BLOCKS.HEADING_1,
        BLOCKS.HEADING_2,
        BLOCKS.HEADING_3,
        BLOCKS.HEADING_4,
        BLOCKS.HEADING_5,
        BLOCKS.HEADING_6,
      ].forEach((type) => getDropdownItem(type).get('button').should('not.be.disabled'));
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
        const buttonsToDisableTable = ['ul', 'ol', 'quote'];

        it(`should disable table button if ${buttonsToDisableTable.join(
          ', '
        )} elements are focused`, () => {
          buttonsToDisableTable.forEach((button) => {
            richText.editor.click();

            getIframe().findByTestId(`${button}-toolbar-button`).click();

            richText.toolbar.table.should('be.disabled');
          });
        });
      });
    });

    describe('Deleting text', () => {
      describe('Backward deletion', () => {
        it('removes the text, not the cell', () => {
          insertTableWithExampleData();
          richText.editor.find('table > tbody > tr:last-child > td:last-child').click();
          richText.editor
            .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Backspace' }); // 8 = delete/backspace

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), emptyCell())
          );

          // make sure it works for table header cells, too
          richText.editor.find('table > tbody > tr:first-child > th:first-child').click();
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
          richText.editor.find('table > tbody > tr:first-child > th:first-child').click();
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
        getIframe().findByTestId('cf-table-actions-button').click();
        return getIframe().findByText(action);
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

      describe('adds row below', () => {
        it('with dropdown', () => {
          doAction('Add row below');

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), cellWithText('quux')),
            row(emptyCell(), emptyCell())
          );
        });

        it('with Tab key at the end', () => {
          richText.editor.tab();

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), cellWithText('quux')),
            row(emptyCell(), emptyCell())
          );
        });
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
});
