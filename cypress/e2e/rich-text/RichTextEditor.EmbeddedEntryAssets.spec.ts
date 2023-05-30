/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { getIframe } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Embedded Entry Assets', { viewportHeight: 2000 }, () => {
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
    backspace: { keyCode: 8, which: 8, key: 'Backspace' },
  };

  function pressEnter() {
    richText.editor.trigger('keydown', keys.enter);
  }

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

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
    cy.shouldConfirm(true);
  });

  afterEach(() => {
    cy.unsetShouldConfirm();
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
      },
    ],
  ];

  for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
    describe(triggerMethod, () => {
      it('adds paragraph before the block when pressing enter if the block is first document node', () => {
        richText.editor.click();
        triggerEmbeddedAsset();

        richText.editor.find('[data-entity-id="example-entity-id"]').click();

        richText.editor.trigger('keydown', keys.enter);

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
        richText.editor.click().find('[data-entity-id="example-entity-id"]').first().click();
        pressEnter();

        // Press enter on the second asset block
        richText.editor.click().find('[data-entity-id="example-entity-id"]').first().click();
        pressEnter();

        richText.expectValue(
          doc(emptyParagraph(), assetBlock(), emptyParagraph(), assetBlock(), emptyParagraph())
        );
      });

      it('adds and removes embedded assets', () => {
        richText.editor.click().then(triggerEmbeddedAsset);

        richText.expectValue(doc(assetBlock(), emptyParagraph()));

        getIframe().findByTestId('cf-ui-card-actions').click();
        getIframe().findByTestId('card-action-remove').click();

        richText.expectValue(undefined);
      });

      it('adds and removes embedded assets by selecting and pressing `backspace`', () => {
        richText.editor.click().then(triggerEmbeddedAsset);

        richText.expectValue(doc(assetBlock(), emptyParagraph()));

        getIframe().findByTestId('cf-ui-asset-card').click();
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
});
