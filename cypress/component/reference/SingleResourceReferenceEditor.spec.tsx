import { Button, Card, Heading, Paragraph } from '@contentful/f36-components';
import React from 'react';

import { SingleResourceReferenceEditor } from '../../../packages/reference/src';
import { mount } from '../mount';
import { createReferenceEditorTestSdk } from '../test-sdks';
import { Entry } from '@contentful/field-editor-shared';

describe('Single resource editor', () => {
  const commonProps = {
    isInitiallyDisabled: false,
    hasCardEditActions: false,
    viewType: 'link',
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

  const findLinkExistingBtn = () => cy.findByTestId('linkEditor.linkExisting');
  // const findCreateLinkBtn = () => cy.findByTestId('create-entry-link-button');
  const findCustomCards = () => cy.findAllByTestId('custom-card');
  // const findDefaultCards = () => cy.findAllByTestId('cf-ui-entry-card');

  it('renders the action button when no value is set', async () => {
    const sdk = createReferenceEditorTestSdk();
    mount(<SingleResourceReferenceEditor {...commonProps} viewType="card" sdk={sdk} />);
  });
});
