import React from 'react';

import { SingleResourceReferenceEditor } from '../../../packages/reference/src';
import { Entity, ResourceLink } from '../../../packages/reference/src/types';
import { createReferenceEditorTestSdk, fixtures } from '../../fixtures';
import { mount } from '../mount';

function asLink<E extends Entity>(entity: E): ResourceLink {
  return {
    sys: {
      type: 'ResourceLink',
      linkType: 'Contentful:Entry',
      urn: `crn:test:::content:spaces/${fixtures.spaces.indifferent.sys.id}/entries/${entity.sys.id}`,
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

describe('Single resource editor', () => {
  const findLinkExistingBtn = () => cy.findByTestId('linkEditor.linkExisting');
  // const findCreateLinkBtn = () => cy.findByTestId('create-entry-link-button');
  // const findCustomCards = () => cy.findAllByTestId('custom-card');
  const findDefaultCards = () => cy.findAllByTestId('cf-ui-entry-card');
  const findMissingCards = () => cy.findAllByTestId('cf-ui-missing-entry-card');

  it('is empty by default', () => {
    const sdk = createReferenceEditorTestSdk();
    mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findDefaultCards().should('not.exist');
    findMissingCards().should('not.exist');
    findLinkExistingBtn().should('be.enabled');
  });

  it('renders default cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: asLink(fixtures.entries.changed),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);
    findDefaultCards().should('have.length', 1);
  });

  it('removes cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: asLink(fixtures.entries.changed),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findDefaultCards().should('have.length', 1);

    cy.findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('delete').click();

    findDefaultCards().should('have.length', 0);
  });

  it('renders missing cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: asLink(fixtures.entries.invalid),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);
    findMissingCards().should('have.length', 1);
  });

  it('removes missing cards', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: asLink(fixtures.entries.invalid),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    findMissingCards().should('have.length', 1);

    findMissingCards().first().findByTestId('cf-ui-icon-button').click();

    findMissingCards().should('have.length', 0);
  });

  // TODO: Enable this test after navigation is moved into sdk.navigator

  // it.only('opens entry when clicking on it', () => {
  //   const sdk = createReferenceEditorTestSdk({
  //     initialValue: [asLink(fixtures.entries.published)],
  //   });
  //   mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />).as(
  //     'editor'
  //   );

  //   cy.spy(sdk.navigator, 'openEntry').as('spy');

  //   findDefaultCards().eq(0).findByTestId('title').click();

  //   cy.get('@spy').should('have.been.calledOnce');
  // });

  it('shows loading state while fetching entry', () => {
    const sdk = createReferenceEditorTestSdk({
      fetchDelay: 2000,
      initialValue: asLink(fixtures.entries.published),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);

    cy.findByTestId('cf-ui-skeleton-form').should('be.visible');
  });

  it('shows empty status', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: asLink(fixtures.entries.empty),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} sdk={sdk} viewType="card" />);

    cy.findByTestId('cf-ui-entry-card').findByText('draft').should('be.visible');
  });

  it('shows changed status', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: asLink(fixtures.entries.changed),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} sdk={sdk} viewType="card" />);

    cy.findByTestId('cf-ui-entry-card').findByText('changed').should('be.visible');
  });

  it('shows published status', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: asLink(fixtures.entries.published),
    });
    mount(<SingleResourceReferenceEditor {...commonProps} sdk={sdk} viewType="card" />);

    cy.findByTestId('cf-ui-entry-card').findByText('published').should('be.visible');
  });
});
