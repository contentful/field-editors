import React from 'react';

import { Card, Heading, Button, Asset } from '@contentful/f36-components';

import { MultipleMediaEditor, CombinedLinkActions } from '../../../packages/reference/src';
import { mount } from '../mount';
import { createReferenceEditorTestSdk } from '../test-sdks';

const commonProps = {
  isInitiallyDisabled: false,
  parameters: {
    instance: {
      showCreateEntityAction: true,
      showLinkEntityAction: true,
    },
  },
  viewType: 'card',
} as React.ComponentProps<typeof MultipleMediaEditor>;

describe('Multiple Media Editor', () => {
  const findCreateAndLinkBtn = () => cy.findByTestId('linkEditor.createAndLink');
  const findLinkExistingBtn = () => cy.findByTestId('linkEditor.linkExisting');
  const findCustomActionsDropdownTrigger = () => cy.findAllByTestId('link-actions-menu-trigger');
  const findCards = () => cy.findAllByTestId('cf-ui-asset-card');
  const findCustomCards = () => cy.findAllByTestId('custom-card');

  describe('default editor', () => {
    it('renders default actions', () => {
      const sdk = createReferenceEditorTestSdk();
      mount(<MultipleMediaEditor {...commonProps} sdk={sdk} />);

      findCreateAndLinkBtn().should('exist');
      findLinkExistingBtn().should('exist');
    });

    it('can insert existing links', () => {
      const sdk = createReferenceEditorTestSdk();
      mount(<MultipleMediaEditor {...commonProps} sdk={sdk} />);

      findLinkExistingBtn().click();
      findCards().should('have.length', 2);
    });

    it('can insert new links', () => {
      const sdk = createReferenceEditorTestSdk();
      mount(<MultipleMediaEditor {...commonProps} sdk={sdk} />);

      findCreateAndLinkBtn().click();
      findCards().should('have.length', 1);
    });
  });

  describe('custom actions injected actions dropdown', () => {
    const validations = [{ size: { max: 2 } }];
    const renderCustomActions = (props) => <CombinedLinkActions {...props} />;

    it('is rendered', () => {
      const sdk = createReferenceEditorTestSdk({ validations });
      mount(
        <MultipleMediaEditor {...commonProps} sdk={sdk} renderCustomActions={renderCustomActions} />
      );

      findCustomActionsDropdownTrigger().should('exist');
    });

    it('is able to interact through props', () => {
      const sdk = createReferenceEditorTestSdk({ validations });
      mount(
        <MultipleMediaEditor {...commonProps} sdk={sdk} renderCustomActions={renderCustomActions} />
      );

      findCustomActionsDropdownTrigger().click();
      findLinkExistingBtn().click();
      findCards().should('have.length', 2);
    });

    it('hides actions when max number of allowed links is reached', () => {
      const sdk = createReferenceEditorTestSdk({ validations });
      mount(
        <MultipleMediaEditor {...commonProps} sdk={sdk} renderCustomActions={renderCustomActions} />
      );

      findCustomActionsDropdownTrigger().click();
      findLinkExistingBtn().click();
      findCards().should('have.length', 2);
      findCustomActionsDropdownTrigger().should('not.exist');
    });
  });

  describe('custom card', () => {
    const renderCustomCard = (props) => {
      const title = props.entity.fields.title;
      if (!title) {
        return false;
      }

      const file = props.entity.fields.file;
      return (
        <Card testId="custom-card">
          <Heading>{title?.['en-US']}</Heading>
          <Asset
            src={file?.['en-US'].url}
            title={file?.['en-US'].fileName}
            style={{ width: 100, height: 100, marginBottom: '10px' }}
          />
          <Button onClick={props.onEdit} style={{ marginRight: '10px' }}>
            Edit
          </Button>
          <Button onClick={props.onRemove}>Remove</Button>
        </Card>
      );
    };
    it('renders custom cards', () => {
      const sdk = createReferenceEditorTestSdk();
      mount(<MultipleMediaEditor {...commonProps} sdk={sdk} renderCustomCard={renderCustomCard} />);

      findLinkExistingBtn().click();
      findCustomCards().should('have.length', 2);
    });

    it('renders default card instead of custom card', () => {
      const sdk = createReferenceEditorTestSdk();
      mount(<MultipleMediaEditor {...commonProps} sdk={sdk} renderCustomCard={renderCustomCard} />);

      findLinkExistingBtn().click();
      findLinkExistingBtn().click(); // Inserts another card using standard card renderer.
      findCards().should('have.length', 1);
      findCustomCards().should('have.length', 2);
    });
  });
});
