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
  const buildHelper =
    (type) =>
    (...children) =>
      block(type, {}, ...children);
  const paragraph = buildHelper(BLOCKS.PARAGRAPH);
  const paragraphWithText = (t) => paragraph(text(t, []));
  const emptyParagraph = () => paragraphWithText('');

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

  describe('Commands', () => {
    describe('Palette', () => {
      const getPalette = () => getIframe().findByTestId('rich-text-commands');
      const getCommandList = () => getIframe().findByTestId('rich-text-commands-list');

      it('should be visible', () => {
        richText.editor.click().type('/');
        getPalette().should('be.visible');
      });

      it('should close on pressing esc', () => {
        richText.editor.click().type('/');
        getPalette().should('be.visible');
        richText.editor.type('{esc}');
        getPalette().should('not.exist');
        richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('/'))));
      });

      it('should be searchable', () => {
        richText.editor.click().type('/asset');
        getCommandList()
          .children()
          .each((child) => {
            cy.wrap(child).should('include.text', 'Asset');
          });
      });

      it('should delete search text after navigating', () => {
        richText.editor.click().type('/asset');
        getCommandList().findByText('Embed Asset').click();
        richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('/'))));
      });

      it('should navigate on category enter', () => {
        richText.editor.click().type('/');
        getCommandList().findByText('Embed Example Content Type').click();
        getCommandList().should('be.visible');
        getCommandList().findByText('Embed Example Content Type').should('not.exist');
      });

      it('should embed entry', () => {
        richText.editor.click().type('/');
        getCommandList().findByText('Embed Example Content Type').click();
        getCommandList().findByText('Hello world').click();

        //this is used instead of snapshot value because we have randomized entry IDs
        richText.getValue().should((doc) => {
          expect(
            doc.content.filter((node) => node.nodeType === BLOCKS.EMBEDDED_ENTRY)
          ).to.have.length(1);
        });
      });

      it('should embed inline', () => {
        richText.editor.click().type('/');
        getCommandList().findByText('Embed Example Content Type - Inline').click();
        getCommandList().findByText('Hello world').click();

        richText.expectSnapshotValue();
      });

      it('should embed asset', () => {
        richText.editor.click().type('/');
        getCommandList().findByText('Embed Asset').click();
        getCommandList().findByText('test').click();

        richText.expectSnapshotValue();
      });

      it('should delete command after embedding', () => {
        richText.editor.click().type('/');
        getCommandList().findByText('Embed Example Content Type').click();
        getCommandList().findByText('Hello world').click();

        richText.editor.children().contains('/').should('not.exist');
      });

      it('should navigate then embed on pressing enter', () => {
        richText.editor.click().type('/');
        getCommandList().findByText('Embed Example Content Type').should('exist');
        richText.editor.type('{enter}');
        getCommandList().findByText('Embed Example Content Type').should('not.exist');
        richText.editor.type('{enter}');

        //this is used instead of snapshot value because we have randomized entry IDs
        richText.getValue().should((doc) => {
          expect(
            doc.content.filter((node) => node.nodeType === BLOCKS.EMBEDDED_ENTRY)
          ).to.have.length(1);
        });
      });

      it('should select next item on down arrow press', () => {
        richText.editor.click().type('/{downarrow}{enter}{enter}');

        richText.editor.findByTestId('embedded-entry-inline').should('exist');
        richText.expectSnapshotValue();
      });

      it('should select previous item on up arrow press', () => {
        richText.editor.click().type('/{downarrow}{uparrow}{enter}{enter}');

        //this is used instead of snapshot value because we have randomized entry IDs
        richText.getValue().should((doc) => {
          expect(
            doc.content.filter((node) => node.nodeType === BLOCKS.EMBEDDED_ENTRY)
          ).to.have.length(1);
        });
      });

      it('should not delete adjacent text', () => {
        richText.editor.click().type('test/{downarrow}{enter}{enter}');
        richText.expectSnapshotValue();
      });

      it('should work inside headings', () => {
        richText.editor.click().type('Heading 1');
        richText.toolbar.toggleHeading(BLOCKS.HEADING_1);
        richText.editor.click().type('/{enter}{enter}');

        //this is used instead of snapshot value because we have randomized entry IDs
        richText.getValue().should((doc) => {
          expect(
            doc.content.filter((node) => {
              return node.nodeType === BLOCKS.EMBEDDED_ENTRY || node.nodeType === BLOCKS.HEADING_1;
            })
          ).to.have.length(2);
        });
      });

      it('should be disabled without any action item', () => {
        // disable embedded entries/assets
        cy.setFieldValidations([
          {
            enabledNodeTypes: ['heading-1'],
          },
        ]);
        cy.reload();

        // try to open command prompt
        richText.editor.click().type('/');
        getPalette().should('not.exist');

        // try to press enter and type content, which would not work with the open palette
        richText.editor.click().type('{enter}Hello');
        richText.expectValue({
          nodeType: 'document',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: '/',
                  marks: [],
                  data: {},
                },
              ],
            },
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Hello',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        });
        // Clear validations after the test
        cy.setFieldValidations([]);
      });
    });
  });
});
