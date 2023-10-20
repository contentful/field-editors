/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  inline,
  text,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { getIframe, mod } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Embedded Resource Inlines', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  const resourceBlock = () =>
    inline(INLINES.EMBEDDED_RESOURCE, {
      target: {
        sys: {
          urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
        },
      },
    });

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  const methods: [string, () => void][] = [
    [
      'using the toolbar button',
      () => {
        richText.toolbar.embed('resource-inline');
      },
    ],
    [
      'using the keyboard shortcut',
      () => {
        richText.editor.type(`{${mod}+shift+p}`);
      },
    ],
  ];

  for (const [triggerMethod, triggerEmbeddedResource] of methods) {
    describe(triggerMethod, () => {
      it('adds and removes embedded entries', () => {
        cy.shouldConfirm(true);
        richText.editor
          .click()
          .type('hello')
          .then(triggerEmbeddedResource)
          .then(() => {
            richText.editor.click().type('world');
          });

        richText.expectValue(
          doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), resourceBlock(), text('world')))
        );

        getIframe().findByTestId('cf-ui-card-actions').click({ force: true });
        getIframe().findByTestId('delete').click({ force: true });

        richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), text('world'))));

        cy.unsetShouldConfirm();

        // TODO: we should also test deletion via {backspace},
        // but this breaks in cypress even though it works in the editor
      });
    });
  }
});
