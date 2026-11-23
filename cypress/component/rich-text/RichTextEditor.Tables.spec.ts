/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { mod } from '../../fixtures/utils';
import {
  assetBlock,
  cell,
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

    describe('Embedded assets in cells', () => {
      const embedAssetInLastCell = () => {
        insertTableWithExampleData();
        richText.toolbar.embed('asset-block');
      };

      it('embeds an asset inside the body cell with the cursor', () => {
        embedAssetInLastCell();

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cell(paragraphWithText('quux'), assetBlock(), emptyParagraph())),
        );
      });

      it('embeds an asset inside an empty body cell', () => {
        insertTable();
        cy.realPress('ArrowRight');
        cy.realPress('ArrowRight');
        richText.toolbar.embed('asset-block');

        expectTable(
          row(emptyHeader(), emptyHeader()),
          row(cell(assetBlock(), emptyParagraph()), emptyCell()),
        );
      });

      it('does not offer to embed an asset in a header cell', () => {
        insertTable();

        richText.toolbar.embedDropdown.click();

        cy.findByTestId('toolbar-toggle-embedded-asset-block').should('not.exist');
      });

      it('can delete the embedded asset and undo it', () => {
        embedAssetInLastCell();

        richText.editor.find('[data-entity-id="published_asset"]').click();
        // .type('{backspace}') does not work on non-typable elements (contentEditable=false)
        richText.editor.trigger('keydown', KEYS.backspace);

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cell(paragraphWithText('quux'), emptyParagraph())),
        );

        richText.toolbar.undo.click();

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cell(paragraphWithText('quux'), assetBlock(), emptyParagraph())),
        );
      });

      it('keeps the asset in the cell when adding a row below', () => {
        embedAssetInLastCell();

        cy.findByTestId('cf-table-actions-button').click();
        cy.findByText('Add row below').click({ force: true });

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cell(paragraphWithText('quux'), assetBlock(), emptyParagraph())),
          row(emptyCell(), emptyCell()),
        );
      });

      describe('other ways to embed', () => {
        const getCommandList = () => cy.findByTestId('rich-text-commands-list');

        it('embeds an asset with the keyboard shortcut in a body cell', () => {
          insertTableWithExampleData();
          richText.editor.type(`{${mod}+shift+a}`);
          richText.forms.embed.confirm();

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(
              cellWithText('baz'),
              cell(paragraphWithText('quux'), assetBlock(), emptyParagraph()),
            ),
          );
        });

        it('ignores the keyboard shortcut in a header cell', () => {
          insertTable();
          richText.editor.type(`{${mod}+shift+a}`);

          cy.findByTestId('fake-dialog-confirm-cta').should('not.exist');
          expectTable(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell()));
        });

        it('embeds an asset with the command palette in a body cell', () => {
          insertTable();
          cy.realPress('ArrowRight');
          cy.realPress('ArrowRight');
          richText.editor.type('/');
          getCommandList().findByText('Embed Asset').click();
          getCommandList().findByText('test').click();

          richText.getValue().then((value) => {
            const [tableNode] = value.content;
            const bodyCell = tableNode.content[1].content[0];

            expect(value.content.map((node) => node.nodeType)).to.deep.equal([
              BLOCKS.TABLE,
              BLOCKS.PARAGRAPH,
            ]);
            expect(bodyCell.content.map((node) => node.nodeType)).to.include(BLOCKS.EMBEDDED_ASSET);
          });
        });

        it('does not offer the command palette asset in a header cell', () => {
          insertTable();
          richText.editor.type('/');

          cy.findByText('Embed Asset').should('not.exist');
        });
      });

      describe('drag and drop', () => {
        const nodeTypes = (nodes: { nodeType: string }[]) => nodes.map((node) => node.nodeType);
        const insertAssetBelowTable = () => {
          insertTableWithExampleData();
          cy.realPress('ArrowDown');
          richText.toolbar.embed('asset-block');
        };

        it('drops an asset inside a body cell', () => {
          cy.viewport(1200, 1200);
          insertAssetBelowTable();

          richText.editor
            .find('[data-entity-id="published_asset"]')
            .dragTo(() => richText.editor.findByText('baz'));

          richText.getValue().then((value) => {
            const [tableNode] = value.content;
            const bodyCell = tableNode.content[1].content[0];

            expect(nodeTypes(value.content)).to.not.include(BLOCKS.EMBEDDED_ASSET);
            expect(nodeTypes(bodyCell.content)).to.include(BLOCKS.EMBEDDED_ASSET);
          });
        });

        it('does not drop an asset inside a header cell', () => {
          cy.viewport(1200, 1200);
          insertAssetBelowTable();

          richText.editor
            .find('[data-entity-id="published_asset"]')
            .dragTo(() => richText.editor.findByText('foo'));

          richText.getValue().then((value) => {
            const [tableNode] = value.content;
            const headerCells = tableNode.content[0].content;

            headerCells.forEach((headerCell) => {
              expect(nodeTypes(headerCell.content)).to.not.include(BLOCKS.EMBEDDED_ASSET);
            });
          });
        });
      });

      it('does not enable the table header while the first row has an asset', () => {
        insertTableWithExampleData();
        cy.findByTestId('cf-table-actions-button').click();
        cy.findByText('Disable table header').click({ force: true });
        richText.editor.contains('foo').click();
        richText.toolbar.embed('asset-block');

        cy.findByTestId('cf-table-actions-button').click();
        cy.findByText('Enable table header').closest('button').should('be.disabled');
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
    });
  });
});
