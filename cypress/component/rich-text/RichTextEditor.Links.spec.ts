import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  text,
  inline,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { mod, openEditLink } from '../../fixtures/utils';
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
          })
        )
      )
    );
  };

  // Type and wait for the text to be persisted
  const safelyType = (text: string) => {
    richText.editor.type(text);

    expectDocumentStructure(['text', text.replace('{selectall}', '')]);
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
        richText.editor.type(`{${mod}}k`);
        richText.forms.hyperlink.linkTarget.type('{backspace}'); // Weird Cypress bug where using CMD+K shortcut types a "k" value in the text field that is focused. So, we remove it first.
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
          ['text', '']
        );

        richText.editor.click().type('{selectall}');
        // TODO: This should just be
        // ```
        // triggerLinkModal();
        // ``
        // but with the keyboard shortcut, this causes an error in Cypress I
        // haven't been able to replicate in the editor. As it's not
        // replicable in "normal" usage we use the toolbar button both places
        // in this test.
        cy.findByTestId('hyperlink-toolbar-button').click();

        expectDocumentStructure(
          // TODO: the editor should normalize this
          ['text', 'The quick brown fox jumps over the lazy '],
          ['text', 'dog']
        );
      });

      it('converts text to URL hyperlink', () => {
        safelyType('My cool website{selectall}');

        triggerLinkModal();
        const form = richText.forms.hyperlink;

        form.linkText.should('have.value', 'My cool website');
        form.linkType.should('have.value', 'hyperlink');
        form.submit.should('be.disabled');

        form.linkTarget.type('https://zombo.com');
        form.submit.should('not.be.disabled');

        form.submit.click();

        expectDocumentStructure(
          ['text', ''],
          [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
          ['text', '']
        );
      });

      it('converts text to entry hyperlink', () => {
        safelyType('My cool entry{selectall}');
        triggerLinkModal();
        const form = richText.forms.hyperlink;

        form.linkText.should('have.value', 'My cool entry');
        form.submit.should('be.disabled');

        form.linkType.should('have.value', 'hyperlink').select('entry-hyperlink');
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
          ['text', ''],
          [
            INLINES.ENTRY_HYPERLINK,
            { target: { sys: { id: 'published-entry', type: 'Link', linkType: 'Entry' } } },
            'My cool entry',
          ],
          ['text', '']
        );
      });

      it('converts text to resource hyperlink', () => {
        safelyType('My cool resource{selectall}');
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
            'My cool resource',
          ],
          ['text', '']
        );
      });

      it('converts text to asset hyperlink', () => {
        safelyType('My cool asset{selectall}');

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
          ['text', ''],
          [
            INLINES.ASSET_HYPERLINK,
            { target: { sys: { id: 'published_asset', type: 'Link', linkType: 'Asset' } } },
            'My cool asset',
          ],
          ['text', '']
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
          ['text', '']
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
          ['text', '']
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
          ['text', '']
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
          ['text', '']
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
          ['text', '']
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
          ['text', '']
        );

        richText.editor
          .click()
          .type('{backspace}{backspace}{backspace}{backspace}', { delay: 100 });

        richText.expectValue(undefined);
      });
    });
  }

  it('focuses on the "Link target" field if it is present', () => {
    safelyType('Sample Text{selectall}');

    cy.findByTestId('hyperlink-toolbar-button').click();

    const form = richText.forms.hyperlink;

    form.linkType.should('have.value', 'hyperlink');

    cy.get('body').then((body) => {
      const focusedEl = body[0].ownerDocument.activeElement;
      expect(focusedEl?.getAttribute('name')).to.eq('linkTarget');
    });

    form.cancel.click();
  });
});
