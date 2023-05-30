/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
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

  const headings = [
    [BLOCKS.PARAGRAPH, 'Normal text'],
    [BLOCKS.HEADING_1, 'Heading 1', `{${mod}+alt+1}`],
    [BLOCKS.HEADING_2, 'Heading 2', `{${mod}+alt+2}`],
    [BLOCKS.HEADING_3, 'Heading 3', `{${mod}+alt+3}`],
    [BLOCKS.HEADING_4, 'Heading 4', `{${mod}+alt+4}`],
    [BLOCKS.HEADING_5, 'Heading 5', `{${mod}+alt+5}`],
    [BLOCKS.HEADING_6, 'Heading 6', `{${mod}+alt+6}`],
  ];

  function addBlockquote(content = '') {
    richText.editor.click().type(content);

    richText.toolbar.quote.click();

    const expectedValue = doc(
      block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text(content, []))),
      block(BLOCKS.PARAGRAPH, {}, text('', []))
    );

    richText.expectValue(expectedValue);

    return expectedValue;
  }

  beforeEach(() => {
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

  describe('Headings', () => {
    headings.forEach(([type, label, shortcut]) => {
      describe(label, () => {
        it(`allows typing ${label} (${type})`, () => {
          richText.editor.click().type('some text');

          richText.toolbar.toggleHeading(type);

          // TODO: We should somehow assert that the editor is focused after this.

          // Account for trailing paragraph
          const expectedValue =
            type === BLOCKS.PARAGRAPH
              ? doc(block(type, {}, text('some text', [])))
              : doc(block(type, {}, text('some text', [])), emptyParagraph());

          richText.expectValue(expectedValue);
        });

        if (shortcut) {
          it(`allows writing ${label} (${type}) via hotkeys ${shortcut}`, () => {
            richText.editor.click().type(shortcut).type('some text');

            const expectedValue = doc(block(type, {}, text('some text', [])), emptyParagraph());

            richText.expectValue(expectedValue);
          });
        }

        it(`should set the dropdown label to ${label}`, () => {
          richText.editor.click().type('some text');

          richText.toolbar.toggleHeading(type);

          richText.toolbar.headingsDropdown.should('have.text', label);
        });

        // TODO: Move this test to either a single test with multiple assertions or for only one heading type due to performance
        if (type !== BLOCKS.PARAGRAPH) {
          it('should unwrap blockquote', () => {
            addBlockquote('some text');

            richText.toolbar.toggleHeading(type);

            const expectedHeadingValue = doc(
              block(type, {}, text('some text', [])),
              block(BLOCKS.PARAGRAPH, {}, text('', []))
            );

            richText.expectValue(expectedHeadingValue);
          });
        } else {
          it('should not unwrap blockquote', () => {
            const expectedQuoteValue = addBlockquote('some text');

            richText.toolbar.toggleHeading(type);

            richText.expectValue(expectedQuoteValue);
          });
        }

        it('should be deleted if empty when pressing delete', () => {
          richText.editor.click(); // to set an initial editor.location

          richText.toolbar.toggleHeading(type);

          richText.editor.type('x{enter}');

          richText.toolbar.embed('entry-block');

          // To make sure paragraph/heading is present
          richText.expectValue(doc(block(type, {}, text('x')), entryBlock(), emptyParagraph()));

          richText.editor
            .click('bottom')
            // Using `delay` to avoid flakiness, cypress triggers a keypress every 10ms and the editor was not responding correctly
            .type('{uparrow}{uparrow}{uparrow}{del}{del}', { delay: 100 });

          richText.expectValue(doc(entryBlock(), emptyParagraph()));
        });

        it('should delete next block if not empty when pressing delete', () => {
          const value = 'some text';
          richText.editor.click().type(value);

          richText.toolbar.toggleHeading(type);

          richText.toolbar.embed('entry-block');

          // Using `delay` to avoid flakiness, cypress triggers a keypress every 10ms and the editor was not responding correcrly
          richText.editor.type('{leftarrow}{del}', { delay: 100 });

          richText.expectValue(doc(block(type, {}, text(value)), emptyParagraph()));
        });
      });
    });
  });
});
