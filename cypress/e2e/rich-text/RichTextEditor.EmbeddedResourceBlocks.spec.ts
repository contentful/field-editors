/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { document as doc, block, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { RichTextPage } from './RichTextPage';

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
  const expectDocumentToBeEmpty = () => richText.expectValue(undefined);
  const resourceBlock = () =>
    block(BLOCKS.EMBEDDED_RESOURCE, {
      target: {
        sys: {
          urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
        },
      },
    });

  const keys = {
    enter: { keyCode: 13, which: 13, key: 'Enter' },
    backspace: { keyCode: 8, which: 8, key: 'Backspace' },
  };

  function pressEnter() {
    richText.editor.trigger('keydown', keys.enter);
  }

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  describe('Embedded Resource Blocks', () => {
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
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedResource] of methods) {
      describe(triggerMethod, () => {
        it('adds paragraph before the block when pressing enter if the block is first document node', () => {
          richText.editor.click().then(triggerEmbeddedResource);

          richText.editor
            .find(
              '[data-entity-id="crn:contentful:::content:spaces/space-id/entries/example-entity-urn"]'
            )
            .click();

          richText.editor.trigger('keydown', keys.enter);

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
            .get(
              '[data-entity-id="crn:contentful:::content:spaces/space-id/entries/example-entity-urn"]'
            )
            .first()
            .click();
          pressEnter();

          // inserts paragraph in-between embeds.
          richText.editor
            .get(
              '[data-entity-id="crn:contentful:::content:spaces/space-id/entries/example-entity-urn"]'
            )
            .first()
            .click();
          pressEnter();

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
          richText.editor.trigger('keydown', keys.backspace);

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
  });

  it('can delete paragraph between resource blocks', () => {
    richText.editor.click();
    richText.toolbar.embed('resource-block');
    richText.editor.type('hey');
    richText.toolbar.embed('resource-block');
    richText.editor.type('{leftarrow}{leftarrow}{backspace}{backspace}{backspace}{backspace}');

    richText.expectValue(doc(resourceBlock(), resourceBlock(), emptyParagraph()));
  });
});
