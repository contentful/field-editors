import React from 'react';

import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  inline,
  text
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk, fixtures } from '../../fixtures';
import { mount } from '../mount';
import { RichTextPage } from './RichTextPage';

const hyperlinkTypes = [INLINES.ENTRY_HYPERLINK, INLINES.ASSET_HYPERLINK];

describe('Rich text hyperlinks with unavailable entity metadata', () => {
  afterEach(() => {
    cy.document().then((document) => {
      document.querySelector<HTMLButtonElement>('[data-test-id="cancel-cta"]')?.click();
    });
  });

  for (const linkType of hyperlinkTypes) {
    for (const [name, entity] of [
      ['undefined entity', undefined],
      ['null entity', null],
      ['missing sys', {}],
      ['undefined sys', { sys: undefined }],
      ['null sys', { sys: null }]
    ] as const) {
      it(`inserts a ${linkType} with ${name} without crashing`, () => {
        const sdk = createRichTextFakeSdk();
        const isEntry = linkType === INLINES.ENTRY_HYPERLINK;
        const selectedEntity = isEntry ? fixtures.entries.published : fixtures.assets.published;
        cy.stub(sdk.dialogs, isEntry ? 'selectSingleEntry' : 'selectSingleAsset').resolves(
          selectedEntity
        );
        cy.stub(isEntry ? sdk.cma.entry : sdk.cma.asset, 'get').resolves(entity);
        mount(<RichTextEditor sdk={sdk} isInitiallyDisabled={false} />);

        const richText = new RichTextPage();
        richText.editor.type('Customer link');
        richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('Customer link'))));
        richText.editor.type('{selectall}');
        richText.toolbar.hyperlink.click();
        const form = richText.forms.hyperlink;
        form.linkType.select(linkType);
        form.linkEntityTarget.click();

        cy.findByText('Content missing or inaccessible').should('be.visible');
        form.submit.should('be.enabled').click();
        richText.editor.find('[data-link-id]').should('contain.text', 'Customer link');
        richText.expectValue(
          doc(
            block(
              BLOCKS.PARAGRAPH,
              {},
              text(''),
              inline(
                linkType,
                {
                  target: {
                    sys: {
                      type: 'Link',
                      linkType: isEntry ? 'Entry' : 'Asset',
                      id: selectedEntity.sys.id
                    }
                  }
                },
                text('Customer link')
              ),
              text('')
            )
          )
        );
        richText.editor.should('be.visible');
      });
    }
  }
});
