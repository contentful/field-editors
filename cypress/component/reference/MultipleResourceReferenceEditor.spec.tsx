import React from 'react';

import { MultipleResourceReferenceEditor } from '../../../packages/reference/src';
import { Entity, ResourceLink } from '../../../packages/reference/src/types';
import { mount } from '../mount';
import { createReferenceEditorTestSdk, fixtures } from '../test-sdks';

function asLink<E extends Entity>(entity: E): ResourceLink {
  return {
    sys: {
      type: 'ResourceLink',
      linkType: 'Contentful:Entry',
      urn: `crn:test:::content:spaces/x-space/entries/${entity.sys.id}`,
    },
  };
}

const commonProps = {
  isInitiallyDisabled: false,
  hasCardEditActions: false,
  viewType: 'card',
  parameters: {
    instance: {
      showCreateEntityAction: undefined,
      showLinkEntityAction: undefined,
      bulkEditing: undefined,
    },
  },
  apiUrl: '',
  getEntryRouteHref: () => '',
};

//TODO: Tests for custom cards after implementation of handling,
//fix 'dialogs.selectSingleResourceEntry' error in linkExisting click handling

describe('Multiple resource editor', () => {
  const findLinkExistingBtn = () => cy.findByTestId('linkEditor.linkExisting');
  // const findCreateLinkBtn = () => cy.findByTestId('create-entry-link-button');
  // const findCustomCards = () => cy.findAllByTestId('custom-card');
  const findDefaultCards = () => cy.findAllByTestId('cf-ui-entry-card');
  const findMissingCards = () => cy.findAllByTestId('cf-ui-missing-entry-card');

  it('is empty by default', () => {
    const sdk = createReferenceEditorTestSdk();
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findDefaultCards().should('not.exist');
    findMissingCards().should('not.exist');
    findLinkExistingBtn().should('be.enabled');
  });

  it('renders default cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.changed)],
    });
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);
    findDefaultCards().should('have.length', 1);
  });

  it('removes cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.changed)],
    });
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findDefaultCards().should('have.length', 1);

    cy.findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('delete').click();

    findDefaultCards().should('have.length', 0);
  });

  it('renders missing cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.invalid)],
    });
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);
    findMissingCards().should('have.length', 1);
  });

  it('removes missing cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.invalid)],
    });
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findMissingCards().should('have.length', 1);

    findMissingCards().first().findByTestId('cf-ui-icon-button').click();

    findMissingCards().should('have.length', 0);
  });

  it('moves cards from actions menu', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.published), asLink(fixtures.entry.changed)],
    });
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findDefaultCards().eq(0).as('firstCard');

    cy.get('@firstCard').findByTestId('title').should('have.text', 'The best article ever');

    cy.get('@firstCard').findByTestId('cf-ui-card-actions').click();
    cy.wait(500);
    cy.findByTestId('move-bottom').click();

    findDefaultCards().eq(1).findByTestId('title').should('have.text', 'The best article ever');
  });

  it('shows disabled links as non-draggable', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.published)],
    });
    mount(
      <MultipleResourceReferenceEditor
        {...commonProps}
        viewType="card"
        isInitiallyDisabled={true}
        sdk={sdk}
      />
    );

    findDefaultCards().eq(0).findByTestId('cf-ui-drag-handle').should('not.exist');
  });

  // TODO: Enable this test after navigation is moved into sdk.navigator

  // it.only('opens entry when clicking on it', () => {
  //   const sdk = createReferenceEditorTestSdk({
  //     initialValue: [asLink(fixtures.entry.published)],
  //   });
  //   mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />).as(
  //     'editor'
  //   );

  //   cy.spy(sdk.navigator, 'openEntry').as('spy');

  //   findDefaultCards().eq(0).findByTestId('title').click();

  //   cy.get('@spy').should('have.been.calledOnce');
  // });

  it('shows loading state while fetching entry', () => {
    const sdk = createReferenceEditorTestSdk({
      fetchDelay: 2000,
      initialValue: [asLink(fixtures.entry.published)],
    });
    mount(<MultipleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    cy.findByTestId('cf-ui-skeleton-form').should('be.visible');
  });

  it(`shows status of entries`, () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [
        asLink(fixtures.entry.empty),
        asLink(fixtures.entry.changed),
        asLink(fixtures.entry.published),
      ],
    });
    mount(<MultipleResourceReferenceEditor {...commonProps} sdk={sdk} viewType="card" />);

    cy.findAllByTestId('cf-ui-entry-card').should('have.length', 3);
    cy.findAllByTestId('cf-ui-entry-card').eq(0).findByText('draft').should('be.visible');
    cy.findAllByTestId('cf-ui-entry-card').eq(1).findByText('changed').should('be.visible');
    cy.findAllByTestId('cf-ui-entry-card').eq(2).findByText('published').should('be.visible');
  });
});
