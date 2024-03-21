import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { mod } from '../../fixtures/utils';
import { emptyParagraph, KEYS, paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen
describe(
  'Rich Text Editor - Embedded Resource Blocks',
  { viewportHeight: 2000, viewportWidth: 1000 },
  () => {
    let richText: RichTextPage;
    const expectDocumentToBeEmpty = () => richText.expectValue(undefined);

    const resourceBlock = () =>
      block(BLOCKS.EMBEDDED_RESOURCE, {
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
          richText.toolbar.embed('resource-block');
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+s}`);
          richText.forms.embed.confirm();
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedResource] of methods) {
      describe(triggerMethod, () => {
        it('adds paragraph before the block when pressing enter if the block is first document node', () => {
          richText.editor.click().then(triggerEmbeddedResource);

          richText.editor
            .find(
              '[data-entity-id="crn:contentful:::content:spaces/indifferent/entries/published-entry"]'
            )
            .click();

          richText.editor.trigger('keydown', KEYS.enter);

          richText.expectValue(doc(emptyParagraph(), resourceBlock(), emptyParagraph()));
        });

        it('adds paragraph between two blocks when pressing enter', () => {
          function addEmbeddedEntry() {
            richText.editor.click('bottom').then(triggerEmbeddedResource);
            richText.editor.click('bottom');
          }

          addEmbeddedEntry();
          addEmbeddedEntry();

          // Inserts paragraph before embed because it's in the first line.
          richText.editor
            .find(
              '[data-entity-id="crn:contentful:::content:spaces/indifferent/entries/published-entry"]'
            )
            .first()
            .click();
          richText.editor.trigger('keydown', KEYS.enter);

          // inserts paragraph in-between embeds.
          richText.editor
            .find(
              '[data-entity-id="crn:contentful:::content:spaces/indifferent/entries/published-entry"]'
            )
            .first()
            .click();
          richText.editor.trigger('keydown', KEYS.enter);

          richText.expectValue(
            doc(
              emptyParagraph(),
              resourceBlock(),
              emptyParagraph(),
              resourceBlock(),
              emptyParagraph()
            )
          );
        });

        it('adds and removes embedded resource', () => {
          richText.editor.click().then(triggerEmbeddedResource);

          richText.expectValue(doc(resourceBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('delete').click();

          richText.expectValue(undefined);
        });

        it('adds and removes embedded resource by selecting and pressing `backspace`', () => {
          richText.editor.click().then(triggerEmbeddedResource);

          richText.expectValue(doc(resourceBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-entry-card').click();
          // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
          richText.editor.trigger('keydown', KEYS.backspace);

          richText.expectValue(undefined);
        });

        it('adds embedded resource between words', () => {
          richText.editor
            .click()
            .type('foobar{leftarrow}{leftarrow}{leftarrow}')
            .then(triggerEmbeddedResource);

          richText.expectValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('foo')),
              resourceBlock(),
              block(BLOCKS.PARAGRAPH, {}, text('bar'))
            )
          );
        });

        it('should be selected on backspace', () => {
          richText.editor.click();
          triggerEmbeddedResource();

          richText.editor.type('{downarrow}X');

          richText.expectValue(doc(resourceBlock(), paragraphWithText('X')));

          richText.editor.type('{backspace}{backspace}');

          richText.expectValue(doc(resourceBlock(), emptyParagraph()));

          richText.editor.type('{backspace}');

          expectDocumentToBeEmpty();
        });
      });
    }

    it('can delete paragraph between resource blocks', () => {
      richText.editor.click();
      richText.toolbar.embed('resource-block');
      richText.editor.type('hey');
      richText.toolbar.embed('resource-block');
      richText.editor.type('{leftarrow}{leftarrow}{backspace}{backspace}{backspace}{backspace}');

      richText.expectValue(doc(resourceBlock(), resourceBlock(), emptyParagraph()));
    });
  }
);
