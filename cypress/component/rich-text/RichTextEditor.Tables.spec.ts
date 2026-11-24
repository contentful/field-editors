/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import {
  cellWithText,
  emptyCell,
  emptyHeader,
  emptyParagraph,
  header,
  headerWithText,
  KEYS,
  paragraphWithText,
  row,
  table,
} from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;

  function getDropdownItem(type: string) {
    return cy.findByTestId(`dropdown-option-${type}`);
  }

  beforeEach(() => {
    richText = new RichTextPage();

    mountRichTextEditor();
  });

  describe('Tables', () => {
    const insertTable = () => {
      richText.editor.click();
      richText.toolbar.table.click();
      return richText.editor;
    };
    const insertTableWithExampleData = () => {
      insertTable().type('foo');
      cy.realPress('ArrowRight');
      richText.editor.type('bar');
      cy.realPress('ArrowRight');
      richText.editor.type('baz');
      cy.realPress('ArrowRight');
      richText.editor.type('quux');
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
              'Cannot resolve a Slate point from DOM point: [object HTMLDivElement],0',
            )
          ) {
            return false;
          }

          // we still want the test to fail in case there's any other error
          return true;
        });

        insertTable();

        cy.realPress('ArrowUp');
        richText.editor.type('{enter}');

        richText.expectValue(
          doc(
            emptyParagraph(),

            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph(),
          ),
        );
      });
    }

    it('can delete embedded inline entries inside table', () => {
      insertTable();

      richText.editor.type('hey');
      richText.toolbar.embed('entry-inline');
      richText.editor.type('{backspace}{backspace}'); // one selects, the second deletes it

      richText.expectValue(
        doc(
          table(
            row(header(paragraphWithText('hey')), emptyHeader()),
            row(emptyCell(), emptyCell()),
          ),
          emptyParagraph(),
        ),
      );
    });

    // Skipping this test because of weird Plate behavior. Will describe it in a follow up PR.
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('does not delete table header cells when selecting the whole header row', () => {
      insertTable();

      richText.editor.type(`hey`);
      cy.realPress(['Shift', 'ArrowDown']);
      richText.editor.type('{backspace}');

      richText.expectValue(
        doc(
          table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
          emptyParagraph(),
        ),
      );
    });

    it('delete multiple lines inside cells', () => {
      insertTable();

      richText.editor.type('hey{enter}{backspace}');

      richText.expectValue(
        doc(
          table(
            row(header(paragraphWithText('hey')), emptyHeader()),
            row(emptyCell(), emptyCell()),
          ),
          emptyParagraph(),
        ),
      );
    });

    it('deletes an empty table with Backspace at the start of its first cell', () => {
      insertTable();

      richText.editor.find('th').first().click();
      cy.realPress('Backspace');

      richText.editor.find('table').should('not.exist');
      richText.expectValue(undefined);

      richText.toolbar.undo.click();
      richText.editor.find('table').should('exist');
      richText.toolbar.redo.click();
      richText.editor.find('table').should('not.exist');

      richText.editor.type('continued');
      richText.getValue().then((value) => expect(value).not.to.be.undefined);
    });

    it('deletes an empty table with Backspace at the start of the following paragraph', () => {
      insertTable();

      richText.editor.children('[data-slate-node="element"]').last().click();
      cy.realPress('Backspace');

      richText.editor.find('table').should('not.exist');
      richText.expectValue(undefined);

      richText.toolbar.undo.click();
      richText.editor.find('table').should('exist');
      richText.toolbar.redo.click();
      richText.editor.find('table').should('not.exist');

      richText.editor.type('continued');
      richText.getValue().then((value) => expect(value).not.to.be.undefined);
    });

    it('keeps an empty table before the first cell of a later populated table', () => {
      insertTable();
      richText.editor.children('[data-slate-node="element"]').last().click();
      richText.toolbar.table.click();

      richText.editor.find('table').should('have.length', 2);
      richText.editor.find('table').last().find('th').first().click().type('x');
      cy.realPress('ArrowLeft');
      cy.realPress('Backspace');

      richText.editor.find('table').should('have.length', 2);
      richText.editor.find('table').last().find('th').first().should('contain.text', 'x');
    });

    it('keeps an empty table when Backspace is pressed at a non-first empty cell', () => {
      insertTable();

      richText.editor.find('th').eq(1).click();
      cy.realPress('Backspace');

      richText.editor.find('table').should('exist');
      richText.editor.find('th').should('have.length', 2);
      richText.editor.find('td').should('have.length', 2);
      richText.getValue().then((value) => expect(value).not.to.be.undefined);
    });

    it('keeps an empty table when Backspace is pressed at a non-first empty body cell', () => {
      insertTable();

      richText.editor.find('td').eq(1).click();
      cy.realPress('Backspace');

      richText.editor.find('table').should('exist');
      richText.editor.find('th').should('have.length', 2);
      richText.editor.find('td').should('have.length', 2);
      richText.getValue().then((value) => expect(value).not.to.be.undefined);
    });

    it('disables block element toolbar buttons when selected', () => {
      insertTable();

      const blockElements = ['quote', 'ul', 'ol', 'hr', 'table'];

      blockElements.forEach((el) => {
        richText.toolbar[el].should('be.disabled');
      });

      richText.toolbar.headingsDropdown.should('be.disabled');

      // select outside the table
      richText.editor.click();
      cy.realPress('ArrowDown');
      cy.wait(100);

      blockElements.forEach((el) => {
        cy.findByTestId(`${el}-toolbar-button`).should('not.be.disabled');
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
      ].forEach((type) => getDropdownItem(type).should('not.be.disabled'));
    });

    describe('Inserting Tables', () => {
      it('replaces empty paragraphs with tables', () => {
        insertTable();

        richText.expectValue(
          doc(
            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph(),
          ),
        );
      });

      it('inserts new table below if paragraph is not empty', () => {
        richText.editor.type('foo');

        insertTable();

        richText.expectValue(
          doc(
            paragraphWithText('foo'),
            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph(),
          ),
        );
      });

      describe('Toolbar', () => {
        const buttonsToDisableTable = ['ul', 'ol', 'quote'];

        it(`should disable table button if ${buttonsToDisableTable.join(
          ', ',
        )} elements are focused`, () => {
          buttonsToDisableTable.forEach((button) => {
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
          richText.editor.find('table > tbody > tr:last-child > td:last-child').click();
          richText.editor
            .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', KEYS.backspace); // 8 = delete/backspace

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), emptyCell()),
          );

          // make sure it works for table header cells, too
          richText.editor.find('table > tbody > tr:first-child > th:first-child').click();
          richText.editor
            .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', KEYS.backspace); // 8 = delete/backspace

          expectTable(
            row(emptyHeader(), headerWithText('bar')),
            row(cellWithText('baz'), emptyCell()),
          );
        });
      });

      describe('Forward deletion', () => {
        it('removes the text, not the cell', () => {
          insertTableWithExampleData();
          richText.editor.find('table > tbody > tr:first-child > th:first-child').click();
          cy.realPress('ArrowLeft');
          cy.realPress('ArrowLeft');
          cy.realPress('ArrowLeft');
          richText.editor
            .type('{del}{del}{del}{del}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', KEYS.delete); // 8 = delete/backspace
          // try forward-deleting from outside the table for good measure
          cy.realPress('ArrowLeft');
          richText.editor.type('{del}').trigger('keydown', KEYS.delete);
          expectTable(
            row(headerWithText(''), headerWithText('bar')),
            row(cellWithText('baz'), cellWithText('quux')),
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
            row(cellWithText('baz'), cellWithText('quux')),
          );
        });
      });

      describe('adds row below', () => {
        it('with dropdown', () => {
          doAction('Add row below');

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), cellWithText('quux')),
            row(emptyCell(), emptyCell()),
          );
        });

        it('with Tab key at the end', () => {
          cy.realPress('Tab');

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), cellWithText('quux')),
            row(emptyCell(), emptyCell()),
          );
        });
      });

      it('adds column left', () => {
        doAction('Add column left');

        expectTable(
          row(headerWithText('foo'), emptyHeader(), headerWithText('bar')),
          row(cellWithText('baz'), emptyCell(), cellWithText('quux')),
        );
      });

      it('adds column right', () => {
        doAction('Add column right');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar'), emptyHeader()),
          row(cellWithText('baz'), cellWithText('quux'), emptyCell()),
        );
      });

      it('enables/disables table header', () => {
        doAction('Disable table header');

        expectTable(
          row(cellWithText('foo'), cellWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux')),
        );

        doAction('Enable table header');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux')),
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

        richText.expectValue(undefined);
      });

      describe('Merging cells', () => {
        const mergedHeader = (data: Record<string, number>, ...paragraphs) =>
          block(BLOCKS.TABLE_HEADER_CELL, data, ...paragraphs);
        const mergeTestId = {
          right: 'cf-table-actions-merge-right',
          down: 'cf-table-actions-merge-down',
          split: 'cf-table-actions-split-cell',
        };

        const clickItem = (testId: string) => {
          cy.findByTestId('cf-table-actions-button').click();
          cy.findByTestId(testId).click({ force: true });
        };

        const focusFirstCell = () => {
          cy.findByText('foo').click();
        };

        it('merges right', () => {
          focusFirstCell();
          clickItem(mergeTestId.right);

          expectTable(
            row(mergedHeader({ colspan: 2 }, paragraphWithText('foo'), paragraphWithText('bar'))),
            row(cellWithText('baz'), cellWithText('quux')),
          );
        });

        it('merges down', () => {
          // the header row cannot merge down, so add a body row first
          doAction('Add row below');
          cy.findByText('baz').click();
          clickItem(mergeTestId.down);

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(
              block(BLOCKS.TABLE_CELL, { rowspan: 2 }, paragraphWithText('baz')),
              cellWithText('quux'),
            ),
            row(emptyCell()),
          );
        });

        it('splits a merged cell', () => {
          focusFirstCell();
          clickItem(mergeTestId.right);
          clickItem(mergeTestId.split);

          // content stays in the origin cell; the freed cell is empty
          expectTable(
            row(
              block(
                BLOCKS.TABLE_HEADER_CELL,
                {},
                paragraphWithText('foo'),
                paragraphWithText('bar'),
              ),
              emptyHeader(),
            ),
            row(cellWithText('baz'), cellWithText('quux')),
          );
        });

        it('adds a row below through a rowspan', () => {
          // the header row cannot merge down, so add a body row first
          doAction('Add row below');
          cy.findByText('baz').click();
          clickItem(mergeTestId.down);
          cy.findByText('quux').click();
          doAction('Add row below');

          // the new row sits inside the rowspan, which grows instead of getting a cell
          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(
              block(BLOCKS.TABLE_CELL, { rowspan: 3 }, paragraphWithText('baz')),
              cellWithText('quux'),
            ),
            row(emptyCell()),
            row(emptyCell()),
          );
        });

        it('deletes a column through a colspan', () => {
          doAction('Add column right');
          focusFirstCell();
          clickItem(mergeTestId.right);
          clickItem(mergeTestId.right);
          cy.findByText('quux').click();
          doAction('Delete column');

          // the colspan shrinks instead of losing its content
          expectTable(
            row(mergedHeader({ colspan: 2 }, paragraphWithText('foo'), paragraphWithText('bar'))),
            row(cellWithText('baz'), emptyCell()),
          );
        });

        it('disables Merge right in the last column', () => {
          cy.findByText('quux').click();
          cy.findByTestId('cf-table-actions-button').click();
          cy.findByTestId(mergeTestId.right).should('be.disabled');
        });

        it('disables Split cell on a plain cell', () => {
          cy.findByText('baz').click();
          cy.findByTestId('cf-table-actions-button').click();
          cy.findByTestId(mergeTestId.split).should('be.disabled');
        });
      });
    });
  });
});
