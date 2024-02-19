import * as React from 'react';

import { Notification } from '@contentful/f36-components';

import { MarkdownEditor, openMarkdownDialog } from '../../../packages/markdown/src';
import { assets } from '../../../packages/markdown/src/__fixtures__/fixtures';
import { FieldAppSDK } from '../../../packages/reference/src';
import { createReferenceEditorTestSdk } from '../../fixtures';
import { mount } from '../mount';

const createMarkdownEditorTestSdk = () => {
  const referenceSdk = createReferenceEditorTestSdk();

  const sdk = {
    ...referenceSdk,
    dialogs: {
      ...referenceSdk.dialogs,
      selectMultipleAssets: () => [assets.published],
    },
    notifier: {
      ...referenceSdk.notifier,
      success: (text) => Notification.success(text),
      error: (text) => Notification.error(text),
    },
    navigator: {
      ...referenceSdk.navigator,
      openNewAsset: async () => ({ entity: assets.created }),
    },
    // We have to add some extra functions with non-generic types to allow inserting mock entities
  } as unknown as FieldAppSDK;
  // Options object in SDK types is optional, but in markdown implementation it's required, so casting for simplicity
  sdk.dialogs.openCurrent = openMarkdownDialog(sdk) as () => Promise<any>;
  return sdk;
};

type RenderMarkdownEditorOptions = {
  spyOnSetValue?: boolean;
  spyOnRemoveValue?: boolean;
  isInitiallyDisabled?: boolean;
};

export const renderMarkdownEditor = ({
  spyOnSetValue = false,
  spyOnRemoveValue = false,
  isInitiallyDisabled = false,
}: RenderMarkdownEditorOptions = {}): void => {
  const sdk = createMarkdownEditorTestSdk();
  if (spyOnSetValue) {
    cy.spy(sdk.field, 'setValue').as('setValue');
  }
  if (spyOnRemoveValue) {
    cy.spy(sdk.field, 'removeValue').as('removeValue');
  }
  mount(<MarkdownEditor sdk={sdk} isInitiallyDisabled={isInitiallyDisabled} />);
};

export const checkValue = (value: string): Cypress.Chainable => {
  return cy.get('@setValue').should('be.calledWith', value);
};

export const checkRemoved = (): Cypress.Chainable => {
  return cy.get('@removeValue').should('be.called');
};

const getInput = () => {
  return cy.findByTestId('markdown-textarea').find('[contenteditable]');
};

export const type = (value: string): Cypress.Chainable => {
  return getInput().type(value, { force: true });
};

export const clearAll = (): void => {
  //Using extra select all because of flakiness with a single clear
  getInput().type('{selectall}', { force: true }).clear({ force: true });
  checkRemoved();
};

//util to select chars backwards from current cursor position
export const selectCharsBackwards = (skip: number, len: number): void => {
  for (let i = 0; i < skip; i++) {
    type('{leftarrow}');
  }
  for (let i = 0; i < len; i++) {
    type('{shift}{leftarrow}');
  }
};
