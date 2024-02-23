import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import {
  block,
  inline,
  document as doc,
  text,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { mod } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Embedded Entry Inlines', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  beforeEach(() => {
    richText = new RichTextPage();

    mountRichTextEditor();
  });

  const methods: [string, () => void][] = [
    [
      'using the toolbar button',
      () => {
        richText.toolbar.embed('entry-inline');
      },
    ],
    [
      'using the keyboard shortcut',
      () => {
        richText.editor.type(`{${mod}+shift+2}`);
      },
    ],
  ];

  for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
    describe(triggerMethod, () => {
      it('adds and removes embedded entries', () => {
        richText.editor
          .click()
          .type('hello')
          .then(triggerEmbeddedAsset)
          .then(() => {
            richText.editor.click().type('world');
          });

        richText.expectValue(
          doc(
            block(
              BLOCKS.PARAGRAPH,
              {},
              text('hello'),
              inline(INLINES.EMBEDDED_ENTRY, {
                target: {
                  sys: {
                    id: 'published-entry',
                    type: 'Link',
                    linkType: 'Entry',
                  },
                },
              }),
              text('world')
            )
          )
        );

        cy.findByTestId('cf-ui-card-actions').click({ force: true });
        cy.findByTestId('delete').click({ force: true });

        richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), text('world'))));

        // TODO: we should also test deletion via {backspace},
        // but this breaks in cypress even though it works in the editor
      });
    });
  }
});
