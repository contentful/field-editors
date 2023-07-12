/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { getIframe } from '../../fixtures/utils';
import documentWithLinks from './document-mocks/documentWithLinks';
import validDocumentThatRequiresNormalization from './document-mocks/validDocumentThatRequiresNormalization';
import { EmbedType, RichTextPage } from './RichTextPage';

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
  const entryBlock = () =>
    block(BLOCKS.EMBEDDED_ENTRY, {
      target: {
        sys: {
          id: 'example-entity-id',
          type: 'Link',
          linkType: 'Entry',
        },
      },
    });
  const assetBlock = () =>
    block(BLOCKS.EMBEDDED_ASSET, {
      target: {
        sys: {
          id: 'example-entity-id',
          type: 'Link',
          linkType: 'Asset',
        },
      },
    });

  const headings = [
    [BLOCKS.PARAGRAPH, 'Normal text'],
    [BLOCKS.HEADING_1, 'Heading 1', `{${mod}+alt+1}`],
    [BLOCKS.HEADING_2, 'Heading 2', `{${mod}+alt+2}`],
    [BLOCKS.HEADING_3, 'Heading 3', `{${mod}+alt+3}`],
    [BLOCKS.HEADING_4, 'Heading 4', `{${mod}+alt+4}`],
    [BLOCKS.HEADING_5, 'Heading 5', `{${mod}+alt+5}`],
    [BLOCKS.HEADING_6, 'Heading 6', `{${mod}+alt+6}`],
  ];

  beforeEach(() => {
    cy.viewport(1280, 720);
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

  describe('history', () => {
    it('supports undo and redo', () => {
      const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text.')));

      // type
      richText.editor.click().type('some text.').click();

      richText.expectValue(expectedValue);

      // undo
      richText.editor.click().type(`{${mod}}z`).click();
      richText.expectValue(undefined);

      // redo
      richText.editor.click().type(`{${mod}}{shift}z`).click();
      richText.expectValue(expectedValue);
    });

    it('correctly undoes after drag&drop', () => {
      cy.viewport(1200, 1200);
      cy.shouldConfirm(true);
      const paragraph = block(BLOCKS.PARAGRAPH, {}, text('some text.'));
      const docBeforeDragAndDrop = doc(paragraph, entryBlock(), emptyParagraph());

      // type text, insert entry block
      richText.editor.click().type('some text.').click();

      richText.toolbar.embed('entry-block');

      richText.expectValue(docBeforeDragAndDrop);

      // drag & drop
      getIframe()
        .findByTestId('cf-ui-entry-card')
        .parent()
        .parent()
        .dragTo(() => richText.editor.findByText('some text.'));
      if (Cypress.browser.name === 'firefox') {
        richText.expectValue(doc(entryBlock(), paragraph, emptyParagraph()));
      } else {
        richText.expectValue(
          doc(
            block(BLOCKS.PARAGRAPH, {}, text('some')),
            entryBlock(),
            block(BLOCKS.PARAGRAPH, {}, text(' text.')),
            emptyParagraph()
          )
        );
      }

      // undo
      // Ensures that drag&drop was recorded in a separate history batch,
      // undoing should not delete the entry block.
      // See the Slate bug report: https://github.com/ianstormtaylor/slate/issues/4694
      richText.editor.click().type(`{${mod}}z`).click();
      richText.expectValue(docBeforeDragAndDrop);
      cy.unsetShouldConfirm();
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

      richText.toolbar.toggleHeading(BLOCKS.HEADING_1);

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

    describe('in a list', () => {
      it('should add a new line', () => {
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

      it('should add a new line after entity block in same list item', () => {
        cy.shouldConfirm(true);
        richText.editor.click();

        richText.toolbar.ul.click();

        richText.editor
          .type('some text 1')
          .type('{enter}')
          .type(`{${mod}+shift+e}`)
          .type('{enter}')
          .type('some more text')
          .type(`{${mod}+shift+e}`)
          .type('{enter}');

        richText.expectSnapshotValue();
        cy.unsetShouldConfirm();
      });
    });
  });

  describe('on action callback', () => {
    it('is invoked callback when rendering links', () => {
      cy.setInitialValue(documentWithLinks);
      cy.editorActions().should('be.empty');
      // Necessary for reading the correct LocalStorage values as we do
      // the initial page load on the beforeEach hook
      cy.reload();
      cy.wait(500);

      richText.expectValue(documentWithLinks);
      cy.editorActions().should(
        'deep.equal',
        new Array(5).fill([
          'linkRendered',
          {
            origin: 'viewport-interaction',
          },
        ])
      );
    });
  });

  describe('invalid document structure', () => {
    it('accepts document with no content', () => {
      const docWithoutContent = {
        nodeType: 'document',
        data: {},
        content: [],
      };

      cy.setInitialValue(docWithoutContent);

      cy.reload();
      cy.wait(500);

      // The field value in this case will still be untouched (i.e. un-normalized)
      // since we won't trigger onChange.
      richText.expectValue(docWithoutContent);

      // Initial normalization should not invoke onChange
      cy.editorEvents()
        .then((events) => events.filter((e) => e.type === 'onValueChanged'))
        .should('deep.equal', []);

      // We can adjust the content
      richText.editor.type('it works');
      richText.expectValue(doc(paragraphWithText('it works')));
    });

    it('does not crash when an empty link is followed by a list', () => {
      const exampleDoc = {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {
                  uri: 'https://example.com',
                },
                content: [],
                nodeType: 'hyperlink',
              },
            ],
            nodeType: 'paragraph',
          },
          {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        marks: [],
                        value: 'some text',
                        nodeType: 'text',
                      },
                      {
                        data: {},
                        marks: [],
                        value: ' more text',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: 'paragraph',
                  },
                ],
                nodeType: 'list-item',
              },
            ],
            nodeType: 'unordered-list',
          },
        ],
        nodeType: 'document',
      };

      cy.setInitialValue(exampleDoc);

      cy.reload();
      // @TODO: find better way to wait until editor is ready before we assert
      cy.wait(1000);

      // The field value in this case will still be untouched (i.e. un-normalized)
      // since we won't trigger onChange.
      richText.expectValue(exampleDoc);

      // Initial normalization should not invoke onChange
      cy.editorEvents()
        .then((events) => events.filter((e) => e.type === 'onValueChanged'))
        .should('deep.equal', []);

      getIframe().find('li').contains('some text more text');
    });

    it('runs initial normalization without triggering a value change', () => {
      cy.setInitialValue(validDocumentThatRequiresNormalization);

      cy.reload();
      cy.wait(500);

      // Should render normalized content
      richText.editor.contains('This is a hyperlink');
      richText.editor.contains('This is a paragraph');
      richText.editor.contains('Text with custom marks');
      richText.editor.contains('paragraph inside list item');
      richText.editor.contains('paragraph inside a nested list');
      richText.editor.contains('blockquote inside list item');
      richText.editor.contains('cell #1');
      richText.editor.contains('cell #2');
      richText.editor.contains('cell #3');
      richText.editor.contains('cell #4');
      richText.editor.contains('cell #5');
      richText.editor.contains('cell #6');

      // The field value in this case will still be untouched (i.e. un-normalized)
      // since we won't trigger onChange.
      richText.expectValue(validDocumentThatRequiresNormalization);

      // Initial normalization should not invoke onChange
      cy.editorEvents()
        .then((events) => events.filter((e) => e.type === 'onValueChanged'))
        .should('deep.equal', []);

      // Trigger normalization by changing the editor content
      richText.editor.type('end');

      richText.expectSnapshotValue();
    });
  });

  describe('Toggling', () => {
    const blocks: [string, EmbedType, string][] = [
      ['From Entry Block to Headings/Paragraph', 'entry-block', 'example-entity-id'],
      ['From Asset Block to Headings/Paragraph', 'asset-block', 'example-entity-id'],
      [
        'From Resource Block to Headings/Paragraph',
        'resource-block',
        'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
      ],
    ];

    blocks.forEach(([title, blockType, id]) => {
      describe(title, () => {
        headings.forEach(([type]) => {
          it(`should not carry over the "data" property from ${blockType} to ${type}`, () => {
            cy.shouldConfirm(true);
            richText.editor.click();

            richText.toolbar.embed(blockType);

            richText.editor.find(`[data-entity-id="${id}"]`).click();

            richText.toolbar.toggleHeading(type);

            richText.expectValue(doc(block(type, {}, text('')), emptyParagraph()));
            cy.unsetShouldConfirm();
          });
        });
      });
    });
  });

  describe('external updates', () => {
    // FIXME: test is broken. The result shows correctly in Cypress but the
    // assertion is not working. To be fixed in a follow up
    // eslint-disable-next-line
    it.skip('renders the new value', () => {
      const firstString = 'Hello, World';
      richText.editor.type(firstString);
      const oldDoc = doc(block(BLOCKS.PARAGRAPH, {}, text(firstString, [])));
      richText.expectValue(oldDoc);

      // simulate a remote value change
      const newDoc = doc(
        block(BLOCKS.PARAGRAPH, {}, text(firstString, [])),
        block(BLOCKS.EMBEDDED_ENTRY, {
          target: {
            sys: {
              id: 'example-entity-id',
              type: 'Link',
              linkType: 'Entry',
            },
          },
        }),
        block(BLOCKS.PARAGRAPH, {}, text('', []))
      );

      cy.getRichTextField().then((field) => {
        const setValueSpy = cy.spy(field, 'setValue');
        cy.getRichTextField().setValueExternal(newDoc);
        richText.expectValue(newDoc);

        // Ensure the value change hasn't triggered  an editor change callback
        // That scenario would cause a loop of updates
        expect(setValueSpy).to.not.be.called;
        // type something else to trigger the editor change callback
        // the new value must contain the external value plus the typed text
        const secondString = 'Bye, world';
        richText.editor.type('{enter}');
        richText.editor.type(secondString);
        richText.expectValue({
          ...newDoc,
          content: [...newDoc.content, block(BLOCKS.PARAGRAPH, {}, text(secondString, []))],
        });
      });
    });
  });

  describe('deleting paragraph between voids', () => {
    it('can delete paragraph between entry blocks', () => {
      cy.shouldConfirm(true);
      richText.editor.click();
      richText.toolbar.embed('entry-block');
      richText.editor.type('hey');
      richText.toolbar.embed('entry-block');
      richText.editor.type('{leftarrow}{leftarrow}{backspace}{backspace}{backspace}{backspace}');

      richText.expectValue(doc(entryBlock(), entryBlock(), emptyParagraph()));
      cy.unsetShouldConfirm();
    });

    it('can delete paragraph between asset blocks', () => {
      cy.shouldConfirm(true);
      richText.editor.click();
      richText.toolbar.embed('asset-block');
      richText.editor.type('hey');
      richText.toolbar.embed('asset-block');
      richText.editor.type('{leftarrow}{leftarrow}{backspace}{backspace}{backspace}{backspace}');

      richText.expectValue(doc(assetBlock(), assetBlock(), emptyParagraph()));
      cy.unsetShouldConfirm();
    });

    it('can delete paragraph between HRs', () => {
      richText.editor.click();
      richText.toolbar.hr.click();
      richText.editor.type('hey');
      richText.toolbar.hr.click();
      richText.editor.type('{leftarrow}{leftarrow}{backspace}{backspace}{backspace}{backspace}');

      const hr = block(BLOCKS.HR, {});
      richText.expectValue(doc(hr, hr, emptyParagraph()));
    });
  });
});
