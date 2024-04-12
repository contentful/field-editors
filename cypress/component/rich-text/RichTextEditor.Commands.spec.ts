import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Commands', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;

  beforeEach(() => {
    cy.viewport(1000, 2000);
    richText = new RichTextPage();
    mountRichTextEditor();
  });

  describe('Palette', () => {
    const getPalette = () => cy.findByTestId('rich-text-commands');
    const getCommandList = () => cy.findByTestId('rich-text-commands-list');

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
      getCommandList().findByText('The best article ever').click();

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
      getCommandList().findByText('The best article ever').click();

      //this is used instead of snapshot value because we have randomized entry IDs
      richText.getValue().should((doc) => {
        expect(
          doc.content[0].content.filter((node) => node.nodeType === INLINES.EMBEDDED_ENTRY)
        ).to.have.length(1);
      });
    });

    it('should embed asset', () => {
      richText.editor.click().type('/');
      getCommandList().findByText('Embed Asset').click();
      getCommandList().findByText('test').click();

      const expectedValue = doc(
        block(BLOCKS.PARAGRAPH, {}, text()),
        block(BLOCKS.EMBEDDED_ASSET, {
          target: { sys: { id: 'published_asset', type: 'Link', linkType: 'Asset' } },
        }),
        block(BLOCKS.PARAGRAPH, {}, text())
      );

      richText.expectValue(expectedValue);
    });

    it('should delete command after embedding', () => {
      richText.editor.click().type('/');
      getCommandList().findByText('Embed Example Content Type').click();
      getCommandList().findByText('The best article ever').click();

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

      //this is used instead of snapshot value because we have randomized entry IDs
      richText.getValue().should((doc) => {
        expect(
          doc.content[0].content.filter((node) => node.nodeType === INLINES.EMBEDDED_ENTRY)
        ).to.have.length(1);
      });
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

      //this is used instead of snapshot value because we have randomized entry IDs
      richText.getValue().should((doc) => {
        expect(doc.content[0].content[0].value).to.equal('test');
        expect(
          doc.content[0].content.filter((node) => node.nodeType === INLINES.EMBEDDED_ENTRY)
        ).to.have.length(1);
      });
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
      const sdk = createRichTextFakeSdk({
        validations: [
          {
            enabledNodeTypes: ['heading-1'],
          },
        ],
      });
      mountRichTextEditor({ sdk, actionsDisabled: true });

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
    });
  });
});
