import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { mod } from '../../fixtures/utils';
import { KEYS, assetBlock, emptyParagraph, paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe(
  'Rich Text Editor - Embedded Entry Assets',
  { viewportHeight: 2000, viewportWidth: 1000 },
  () => {
    let richText: RichTextPage;
    const expectDocumentToBeEmpty = () => richText.expectValue(undefined);

    beforeEach(() => {
      richText = new RichTextPage();

      mountRichTextEditor();
    });

    const methods: [string, () => void][] = [
      [
        'using the toolbar button',
        () => {
          richText.toolbar.embed('asset-block');
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+a}`);
          richText.forms.embed.confirm();
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds paragraph before the block when pressing enter if the block is first document node', () => {
          richText.editor.click();
          triggerEmbeddedAsset();

          richText.editor.find('[data-entity-id="published_asset"]').click();
          richText.editor.trigger('keydown', KEYS.enter);

          richText.expectValue(doc(emptyParagraph(), assetBlock(), emptyParagraph()));
        });

        it('adds paragraph between two blocks when pressing enter', () => {
          function addEmbeddedAsset() {
            richText.editor.click('bottom').then(triggerEmbeddedAsset);
            richText.editor.click('bottom');
          }

          addEmbeddedAsset();
          addEmbeddedAsset();

          // Press enter on the first asset block
          richText.editor.click().find('[data-entity-id="published_asset"]').first().click();
          richText.editor.trigger('keydown', KEYS.enter);

          // Press enter on the second asset block
          richText.editor.click().find('[data-entity-id="published_asset"]').first().click();
          richText.editor.trigger('keydown', KEYS.enter);

          richText.expectValue(
            doc(emptyParagraph(), assetBlock(), emptyParagraph(), assetBlock(), emptyParagraph())
          );
        });

        it('adds and removes embedded assets', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.expectValue(doc(assetBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('card-action-remove').click();

          richText.expectValue(undefined);
        });

        it('adds and removes embedded assets by selecting and pressing `backspace`', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.expectValue(doc(assetBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-asset-card').click();
          // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
          richText.editor.trigger('keydown', KEYS.backspace);

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
              assetBlock(),
              block(BLOCKS.PARAGRAPH, {}, text('bar'))
            )
          );
        });

        it('should be selected on backspace', () => {
          richText.editor.click();
          triggerEmbeddedAsset();

          richText.editor.type('{downarrow}X');

          richText.expectValue(doc(assetBlock(), paragraphWithText('X')));

          richText.editor.type('{backspace}{backspace}');

          richText.expectValue(doc(assetBlock(), emptyParagraph()));

          richText.editor.type('{backspace}');

          expectDocumentToBeEmpty();
        });
      });
    }
  }
);
