/* eslint-disable mocha/no-setup-in-describe */

import { FieldAppSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mod } from '../../fixtures/utils';
import newLineEntityBlockListItem from './document-mocks/newLineEntityBlockListItem';
import normalizationWithoutValueChange from './document-mocks/normalizationWithoutValueChange';
import validDocumentThatRequiresNormalization from './document-mocks/validDocumentThatRequiresNormalization';
import { assetBlock, emptyParagraph, paragraphWithText } from './helpers';
import { EmbedType, RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen
describe('Rich Text Editor', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;
  let sdk: FieldAppSDK;

  const entryBlock = () =>
    block(BLOCKS.EMBEDDED_ENTRY, {
      target: {
        sys: {
          id: 'published-entry',
          type: 'Link',
          linkType: 'Entry',
        },
      },
    });

  beforeEach(() => {
    cy.viewport(1280, 720);
    richText = new RichTextPage();
    mountRichTextEditor();
  });

  it('is empty by default', () => {
    richText.expectValue(undefined);
  });

  it('disable all editor actions on readonly mode', () => {
    sdk = createRichTextFakeSdk({
      initialValue: doc(
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
      ),
    });
    mountRichTextEditor({ sdk, isInitiallyDisabled: true });

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
    it('supports undo and redo with keyboard shortcuts', () => {
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

    it('supports undo and redo with toolbar buttons', () => {
      const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text.')));

      // type
      richText.editor.click().type('some text.').click();

      richText.expectValue(expectedValue);

      // undo
      richText.toolbar.undo.click();
      richText.expectValue(undefined);

      // redo
      richText.toolbar.redo.click();
      richText.expectValue(expectedValue);
    });

    it('correctly undoes after drag&drop', () => {
      cy.viewport(1200, 1200);
      const paragraph = block(BLOCKS.PARAGRAPH, {}, text('some text.'));
      const docBeforeDragAndDrop = doc(paragraph, entryBlock(), emptyParagraph());

      // type text, insert entry block
      richText.editor.click().type('some text.').click();

      richText.toolbar.embed('entry-block');

      richText.expectValue(docBeforeDragAndDrop);

      // drag & drop
      cy.findByTestId('cf-ui-entry-card')
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
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.type('some text 1').type('{enter}').type(`{${mod}+shift+e}}`);
        richText.forms.embed.confirm();
        richText.editor.type('{enter}').type('some more text').type(`{${mod}+shift+e}}`);
        richText.forms.embed.confirm();
        richText.editor.type('{enter}');

        richText.expectValue(newLineEntityBlockListItem);
      });
    });
  });

  describe('invalid document structure', () => {
    it('accepts document with no content', () => {
      const docWithoutContent = {
        nodeType: 'document',
        data: {},
        content: [],
      };

      sdk = createRichTextFakeSdk({ initialValue: docWithoutContent });
      mountRichTextEditor({ sdk });

      const onValueChangedSpy = cy.spy(sdk.field, 'onValueChanged');

      // The field value in this case will still be untouched (i.e. un-normalized)
      // since we won't trigger onChange.
      richText.expectValue(docWithoutContent);

      // Initial normalization should not invoke onChange
      expect(onValueChangedSpy).not.to.be.called;

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

      sdk = createRichTextFakeSdk({ initialValue: exampleDoc });
      mountRichTextEditor({ sdk });

      const onValueChangedSpy = cy.spy(sdk.field, 'onValueChanged');

      // The field value in this case will still be untouched (i.e. un-normalized)
      // since we won't trigger onChange.
      richText.expectValue(exampleDoc);

      // Initial normalization should not invoke onChange
      expect(onValueChangedSpy).not.to.be.called;

      richText.editor.find('li').contains('some text more text');
    });

    it('runs initial normalization without triggering a value change', () => {
      sdk = createRichTextFakeSdk({ initialValue: validDocumentThatRequiresNormalization });
      mountRichTextEditor({ sdk });

      const onValueChangedSpy = cy.spy(sdk.field, 'onValueChanged');
      const onSchemaErrorsChangedSpy = cy.spy(sdk.field, 'onSchemaErrorsChanged');

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
      expect(onValueChangedSpy).not.to.be.called;

      // Trigger normalization by changing the editor content
      richText.editor.type('end');

      richText.expectValue(normalizationWithoutValueChange);

      expect(onSchemaErrorsChangedSpy).not.to.be.called;
    });
  });

  describe('Toggling', () => {
    const blocks: [string, EmbedType, string][] = [
      ['From Entry Block to Headings/Paragraph', 'entry-block', 'published-entry'],
      ['From Asset Block to Headings/Paragraph', 'asset-block', 'published_asset'],
      [
        'From Resource Block to Headings/Paragraph',
        'resource-block',
        'crn:contentful:::content:spaces/indifferent/entries/published-entry',
      ],
    ];

    blocks.forEach(([title, blockType, id]) => {
      describe(title, () => {
        [
          [BLOCKS.PARAGRAPH, 'Normal text'],
          [BLOCKS.HEADING_1, 'Heading 1', `{${mod}+alt+1}`],
          [BLOCKS.HEADING_2, 'Heading 2', `{${mod}+alt+2}`],
          [BLOCKS.HEADING_3, 'Heading 3', `{${mod}+alt+3}`],
          [BLOCKS.HEADING_4, 'Heading 4', `{${mod}+alt+4}`],
          [BLOCKS.HEADING_5, 'Heading 5', `{${mod}+alt+5}`],
          [BLOCKS.HEADING_6, 'Heading 6', `{${mod}+alt+6}`],
        ].forEach(([type]) => {
          it(`should not carry over the "data" property from ${blockType} to ${type}`, () => {
            richText.editor.click();

            richText.toolbar.embed(blockType);

            richText.editor.find(`[data-entity-id="${id}"]`).click();

            richText.toolbar.toggleHeading(type);

            richText.expectValue(doc(block(type, {}, text('')), emptyParagraph()));
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
              id: 'published-entry',
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
      richText.editor.click();
      richText.toolbar.embed('entry-block');
      richText.editor.type('hey');
      richText.toolbar.embed('entry-block');
      richText.editor.type('{leftarrow}{leftarrow}{backspace}{backspace}{backspace}{backspace}');

      richText.expectValue(doc(entryBlock(), entryBlock(), emptyParagraph()));
    });

    it('can delete paragraph between asset blocks', () => {
      richText.editor.click();
      richText.toolbar.embed('asset-block');
      richText.editor.type('hey');
      richText.toolbar.embed('asset-block');
      richText.editor.type('{leftarrow}{leftarrow}{backspace}{backspace}{backspace}{backspace}');

      richText.expectValue(doc(assetBlock(), assetBlock(), emptyParagraph()));
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
