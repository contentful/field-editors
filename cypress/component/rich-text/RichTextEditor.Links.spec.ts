import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import type { Editor } from 'slate';
import { ELEMENT_TO_NODE } from 'slate-dom';

import {
  block,
  document as doc,
  inline,
  text,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mod } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Links', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;

  beforeEach(() => {
    richText = new RichTextPage();

    mountRichTextEditor();
  });

  const expectDocumentStructure = (...nodes) => {
    richText.expectValue(
      doc(
        block(
          BLOCKS.PARAGRAPH,
          {},
          ...nodes.map(([nodeType, ...content]) => {
            if (nodeType === 'text') return text(...content);
            const [data, textContent] = content;
            return inline(nodeType, data, text(textContent));
          }),
        ),
      ),
    );
  };

  // Type and wait for the text to be persisted
  const safelyType = (text: string) => {
    richText.editor.click().should('be.focused').type(text);

    expectDocumentStructure(['text', text.replace('{selectall}', '')]);
  };

  const selectTextInsideParagraph = (text: string) => {
    safelyType(`Before ${text} After`);
    richText.editor.find('[data-slate-string]').then(($span) => {
      const document = $span[0].ownerDocument;
      const range = document.createRange();
      const textNode = $span[0].firstChild!;
      range.setStart(textNode, 'Before '.length);
      range.setEnd(textNode, 'Before '.length + text.length);
      const selection = document.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    });

    // Native selection changes reach Slate asynchronously. Wait before opening the dialog.
    richText.editor.should(($editor) => {
      const editor = ELEMENT_TO_NODE.get($editor[0]) as Editor;
      expect(editor.selection).to.deep.equal({
        anchor: { path: [0, 0], offset: 'Before '.length },
        focus: { path: [0, 0], offset: 'Before '.length + text.length },
      });
    });
  };

  const openEditLink = () => {
    richText.editor.findByTestId('cf-ui-text-link').click();
    cy.findByTestId('cf-ui-popover-content')
      .should('be.visible')
      .findByLabelText('Edit link')
      .click();
  };

  const methods: [string, () => void][] = [
    [
      'using the link toolbar button',
      () => {
        richText.toolbar.hyperlink.click();
      },
    ],
    [
      'using the link keyboard shortcut',
      () => {
        richText.editor.should('be.focused');
        cy.realPress([mod === 'meta' ? 'Meta' : 'Control', 'K']);
      },
    ],
  ];

  for (const [triggerMethod, triggerLinkModal] of methods) {
    describe(triggerMethod, () => {
      it('adds and removes hyperlinks', () => {
        safelyType('The quick brown fox jumps over the lazy ');

        triggerLinkModal();

        const form = richText.forms.hyperlink;
        form.submit.should('be.disabled');

        form.linkText.type('dog');
        form.submit.should('be.disabled');

        form.linkTarget.type('https://zombo.com');
        form.submit.should('not.be.disabled');

        form.submit.click();

        expectDocumentStructure(
          ['text', 'The quick brown fox jumps over the lazy '],
          [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'dog'],
          ['text', ''],
        );

        richText.editor.click().type('{selectall}');
        triggerLinkModal();

        expectDocumentStructure(['text', 'The quick brown fox jumps over the lazy dog']);
      });

      it('converts text to URL hyperlink', () => {
        selectTextInsideParagraph('My cool website');

        triggerLinkModal();
        const form = richText.forms.hyperlink;

        form.linkText.should('have.value', 'My cool website');
        form.linkType.should('have.value', 'hyperlink');
        form.submit.should('be.disabled');

        form.linkTarget.type('https://zombo.com');
        form.submit.should('not.be.disabled');

        form.submit.click();

        expectDocumentStructure(
          ['text', 'Before '],
          [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
          ['text', ' After'],
        );
      });

      it('converts text to entry hyperlink', () => {
        selectTextInsideParagraph('My cool entry');
        triggerLinkModal();
        const form = richText.forms.hyperlink;

        form.linkText.should('have.value', 'My cool entry');
        form.submit.should('be.disabled');

        form.linkType.should('have.value', 'hyperlink').select('entry-hyperlink');
        form.submit.should('be.disabled');

        cy.findByTestId('cf-ui-entry-card').should('not.exist');
        form.linkEntityTarget.should('have.text', 'Select entry').click();

        cy.window().then((win) => {
          const options = (win as any).lastSelectSingleEntryOptions;
          expect(options).to.be.an('object');
          expect(options.recommendations).to.be.an('object');
          expect(options.recommendations.searchQuery).to.equal('My cool entry');
        });
        richText.forms.embed.confirm();

        cy.findByTestId('cf-ui-entry-card').should('exist');

        form.linkEntityTarget.should('have.text', 'Remove selection').click();
        cy.findByTestId('cf-ui-entry-card').should('not.exist');

        form.linkEntityTarget.should('have.text', 'Select entry').click();
        richText.forms.embed.confirm();
        cy.findByTestId('cf-ui-entry-card').should('exist');

        form.submit.click();

        expectDocumentStructure(
          ['text', 'Before '],
          [
            INLINES.ENTRY_HYPERLINK,
            { target: { sys: { id: 'published-entry', type: 'Link', linkType: 'Entry' } } },
            'My cool entry',
          ],
          ['text', ' After'],
        );
      });

      it('converts text to resource hyperlink', () => {
        selectTextInsideParagraph('My cool resource');
        triggerLinkModal();
        const form = richText.forms.hyperlink;

        form.linkText.should('have.value', 'My cool resource');
        form.submit.should('be.disabled');

        form.linkType.should('have.value', 'hyperlink').select(INLINES.RESOURCE_HYPERLINK);
        form.submit.should('be.disabled');

        cy.findByTestId('cf-ui-entry-card').should('not.exist');
        form.linkEntityTarget.should('have.text', 'Select entry').click();
        richText.forms.embed.confirm();
        cy.findByTestId('cf-ui-entry-card').should('exist');

        form.linkEntityTarget.should('have.text', 'Remove selection').click();
        cy.findByTestId('cf-ui-entry-card').should('not.exist');

        form.linkEntityTarget.should('have.text', 'Select entry').click();
        richText.forms.embed.confirm();
        cy.findByTestId('cf-ui-entry-card').should('exist');

        form.submit.click();

        expectDocumentStructure(
          ['text', 'Before '],
          [
            INLINES.RESOURCE_HYPERLINK,
            {
              target: {
                sys: {
                  urn: 'crn:contentful:::content:spaces/indifferent/entries/published-entry',
                  type: 'ResourceLink',
                  linkType: 'Contentful:Entry',
                },
              },
            },
            'My cool resource',
          ],
          ['text', ' After'],
        );
      });

      it('converts text to asset hyperlink', () => {
        selectTextInsideParagraph('My cool asset');

        triggerLinkModal();

        const form = richText.forms.hyperlink;

        form.linkText.should('have.value', 'My cool asset');
        form.submit.should('be.disabled');

        form.linkType.should('have.value', 'hyperlink').select('asset-hyperlink');
        form.submit.should('be.disabled');

        cy.findByTestId('cf-ui-asset-card').should('not.exist');
        form.linkEntityTarget.should('have.text', 'Select asset').click();
        richText.forms.embed.confirm();
        cy.findByTestId('cf-ui-asset-card').should('exist');

        form.linkEntityTarget.should('have.text', 'Remove selection').click();
        cy.findByTestId('cf-ui-asset-card').should('not.exist');

        form.linkEntityTarget.should('have.text', 'Select asset').click();
        richText.forms.embed.confirm();
        cy.findByTestId('cf-ui-asset-card').should('exist');

        form.submit.click();

        expectDocumentStructure(
          ['text', 'Before '],
          [
            INLINES.ASSET_HYPERLINK,
            { target: { sys: { id: 'published_asset', type: 'Link', linkType: 'Asset' } } },
            'My cool asset',
          ],
          ['text', ' After'],
        );
      });

      it('edits hyperlinks', () => {
        safelyType('My cool website{selectall}');

        triggerLinkModal();

        // Part 1:
        // Create a hyperlink
        const form = richText.forms.hyperlink;

        form.linkText.should('have.value', 'My cool website');
        form.linkTarget.type('https://zombo.com');
        form.submit.click();

        expectDocumentStructure(
          ['text', ''],
          [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
          ['text', ''],
        );

        // Part 2:
        // Update hyperlink to entry link
        openEditLink();
        form.linkText.should('not.exist');
        form.linkType.should('have.value', 'hyperlink').select('entry-hyperlink');
        form.linkEntityTarget.should('have.text', 'Select entry').click();
        richText.forms.embed.confirm();
        form.submit.click();

        expectDocumentStructure(
          ['text', ''],
          [
            INLINES.ENTRY_HYPERLINK,
            { target: { sys: { id: 'published-entry', type: 'Link', linkType: 'Entry' } } },
            'My cool website',
          ],
          ['text', ''],
        );

        // Part 3:
        // Update entry link to asset link
        openEditLink();
        form.linkText.should('not.exist');
        form.linkType.should('have.value', 'entry-hyperlink').select('asset-hyperlink');
        form.linkEntityTarget.should('have.text', 'Select asset').click();
        richText.forms.embed.confirm();
        form.submit.click();

        expectDocumentStructure(
          ['text', ''],
          [
            INLINES.ASSET_HYPERLINK,
            { target: { sys: { id: 'published_asset', type: 'Link', linkType: 'Asset' } } },
            'My cool website',
          ],
          ['text', ''],
        );

        // Part 4:
        // Update asset link to resource link
        openEditLink();
        form.linkText.should('not.exist');
        form.linkType.should('have.value', 'asset-hyperlink').select('resource-hyperlink');
        form.linkEntityTarget.should('have.text', 'Select entry').click();
        richText.forms.embed.confirm();
        form.submit.click();

        expectDocumentStructure(
          ['text', ''],
          [
            INLINES.RESOURCE_HYPERLINK,
            {
              target: {
                sys: {
                  urn: 'crn:contentful:::content:spaces/indifferent/entries/published-entry',
                  type: 'ResourceLink',
                  linkType: 'Contentful:Entry',
                },
              },
            },
            'My cool website',
          ],
          ['text', ''],
        );

        // Part 5:
        // Update resource link to hyperlink
        openEditLink();
        form.linkText.should('not.exist');
        form.linkType.should('have.value', 'resource-hyperlink').select('hyperlink');
        form.linkTarget.type('https://zombo.com');
        form.submit.click();

        expectDocumentStructure(
          ['text', ''],
          [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
          ['text', ''],
        );
      });

      it('is removed from the document structure when empty', () => {
        richText.editor.click();

        triggerLinkModal();

        const form = richText.forms.hyperlink;

        form.linkText.type('Link');
        form.linkTarget.type('https://link.com');
        form.submit.click();

        expectDocumentStructure(
          ['text', ''],
          [INLINES.HYPERLINK, { uri: 'https://link.com' }, 'Link'],
          ['text', ''],
        );

        richText.editor
          .click()
          .type('{moveToEnd}{backspace}{backspace}{backspace}{backspace}', { delay: 100 });

        richText.expectValue(undefined);
      });
    });
  }

  it('focuses on the "Link target" field if it is present', () => {
    safelyType('Sample Text{selectall}');

    cy.findByTestId('hyperlink-toolbar-button').click();

    const form = richText.forms.hyperlink;

    form.linkType.should('have.value', 'hyperlink');

    form.linkTarget.should('be.focused');

    form.cancel.click();
  });

  describe('with external updates while the dialog is open', () => {
    const paragraph = (value: string) => block(BLOCKS.PARAGRAPH, {}, text(value));

    for (const action of ['submit', 'cancel'] as const) {
      it(`preserves replacement content and continues editing after ${action}`, () => {
        const sdk = createRichTextFakeSdk({
          initialValue: doc(paragraph('first'), paragraph('second'), paragraph('link')),
        });
        mountRichTextEditor({ sdk });
        richText.editor.find('[data-slate-string]').contains('link').click();
        richText.editor.should(($editor) => {
          const editor = ELEMENT_TO_NODE.get($editor[0]) as Editor;
          expect(editor.selection?.anchor.path).to.deep.equal([2, 0]);
        });
        richText.toolbar.hyperlink.click();
        richText.forms.hyperlink.linkText.clear().type('link');
        richText.forms.hyperlink.linkTarget.type('https://example.com');

        // External field updates can arrive while the user fills in a link dialog.
        cy.getRichTextField().then((field) => field.setValue(doc(paragraph('replacement'))));
        richText.editor.should('contain.text', 'replacement');
        richText.forms.hyperlink[action].click();
        cy.get('#field-editor-modal-root').should('not.exist');
        richText.expectValue(doc(paragraph('replacement')));

        richText.editor.click().type('{moveToEnd}!');
        richText.expectValue(doc(paragraph('replacement!')));
      });
    }

    it('applies the link when an external update changes another paragraph', () => {
      const sdk = createRichTextFakeSdk({
        initialValue: doc(paragraph('first'), paragraph('link')),
      });
      mountRichTextEditor({ sdk });
      richText.editor.find('[data-slate-string]').contains('link').click();
      richText.editor.then(($editor) => {
        const editor = ELEMENT_TO_NODE.get($editor[0]) as Editor;
        editor.select({ anchor: { path: [1, 0], offset: 0 }, focus: { path: [1, 0], offset: 4 } });
      });
      richText.toolbar.hyperlink.click();
      richText.forms.hyperlink.linkTarget.type('https://example.com');

      cy.getRichTextField().then((field) =>
        field.setValue(doc(paragraph('first!'), paragraph('link'))),
      );
      richText.editor.should('contain.text', 'first!');
      richText.forms.hyperlink.submit.click();
      cy.get('#field-editor-modal-root').should('not.exist');
      richText.expectValue(
        doc(
          paragraph('first!'),
          block(
            BLOCKS.PARAGRAPH,
            {},
            text(''),
            inline(INLINES.HYPERLINK, { uri: 'https://example.com' }, text('link')),
            text(''),
          ),
        ),
      );
    });
  });
});
