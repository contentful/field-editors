/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { getIframe } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Commands', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  beforeEach(() => {
    cy.viewport(1000, 2000);
    richText = new RichTextPage();
    richText.visit();
  });

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
