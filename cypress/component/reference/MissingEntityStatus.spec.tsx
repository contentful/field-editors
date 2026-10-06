import React from 'react';

import { MultipleEntryReferenceEditor } from '@contentful/field-editor-reference';

import { createReferenceEditorTestSdk, fixtures } from '../../fixtures';
import { mount } from '../mount';

describe('Reference editor with unavailable entity metadata', () => {
  for (const [name, entity] of [
    ['undefined entity', undefined],
    ['null entity', null],
    ['missing sys', {}],
    ['undefined sys', { sys: undefined }],
    ['null sys', { sys: null }]
  ] as const) {
    it(`keeps the editor and other references usable with ${name}`, () => {
      const sdk = createReferenceEditorTestSdk({
        initialValue: ['unavailable-entry', fixtures.entries.published.sys.id].map((id) => ({
          sys: { type: 'Link', linkType: 'Entry', id }
        }))
      });
      cy.stub(sdk.cma.entry, 'get').callsFake(async ({ entryId }) =>
        entryId === 'unavailable-entry' ? entity : fixtures.entries.published
      );
      mount(
        <MultipleEntryReferenceEditor
          sdk={sdk}
          isInitiallyDisabled={false}
          parameters={{ instance: { showLinkEntityAction: true } }}
          hasCardEditActions
          viewType="link"
        />
      );

      cy.findByText('Content missing or inaccessible').should('be.visible');
      cy.findByText('The best article ever').should('be.visible');
      cy.findByText('published').should('be.visible');
      cy.findByTestId('linkEditor.linkExisting').should('be.enabled');
    });
  }
});
