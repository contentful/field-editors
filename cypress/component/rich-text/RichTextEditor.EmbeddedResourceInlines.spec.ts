import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  text,
  inline,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { mod } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe(
  'Rich Text Editor - Embedded Resource Inlines',
  { viewportHeight: 2000, viewportWidth: 1000 },
  () => {
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
      richText = new RichTextPage();

      mountRichTextEditor();
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
          richText.forms.embed.confirm();
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
        });

        it('adds and removes embedded resource by selecting and pressing `backspace`', () => {
          richText.editor.click().type('hello').then(triggerEmbeddedResource);

          richText.expectValue(
            doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), resourceBlock(), text('')))
          );

          // TODO: the entry resource is selected first, why not here too?
          richText.editor.click().type('{backspace}');

          richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('hello'))));
        });
      });
    }
  }
);
