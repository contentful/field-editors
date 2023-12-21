import React from 'react';

import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { RichTextEditor } from '../../../packages/rich-text/src';
import {
  block,
  document as doc,
  text,
  inline,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mod } from '../../fixtures/utils';
import { mount } from '../mount';
import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Embedded Resource Inlines', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  const resourceBlock = () =>
    inline(INLINES.EMBEDDED_RESOURCE, {
      target: {
        sys: {
          urn: 'crn:contentful:::content:spaces/indifferent/entries/published-entry',
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
        },
      },
    });

  beforeEach(() => {
    const sdk = createRichTextFakeSdk();
    richText = new RichTextPage();

    mount(<RichTextEditor sdk={sdk} isInitiallyDisabled={false} />);
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

        cy.findByTestId('cf-ui-card-actions').click({ force: true });
        cy.findByTestId('delete').click({ force: true });

        richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), text('world'))));

        // TODO: we should also test deletion via {backspace},
        // but this breaks in cypress even though it works in the editor
      });
    });
  }
});
