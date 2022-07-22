import React from 'react';

import { Card, Heading, Paragraph, Button } from '@contentful/f36-components';
import { Entry } from '@contentful/field-editor-shared';

import { MultipleEntryReferenceEditor } from '../../../packages/reference/src';
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
  hasCardEditActions: true,
  viewType: 'link',
} as React.ComponentProps<typeof MultipleEntryReferenceEditor>;

describe('Multiple Reference Editor', () => {
  const findLinkExistingBtn = () => cy.findByTestId('linkEditor.linkExisting');
  const findCustomCards = () => cy.findAllByTestId('custom-card');
  const findDefaultCards = () => cy.findAllByTestId('cf-ui-entry-card');

  it('is empty by default', () => {
    const sdk = createReferenceEditorTestSdk();
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    findCustomCards().should('not.exist');
    findLinkExistingBtn().should('be.enabled');
  });

  it('renders custom cards', () => {
    const sdk = createReferenceEditorTestSdk();
    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        renderCustomCard={(props) => {
          const entity = props.entity as Entry;
          const { exField, exDesc } = entity.fields;

          if (!exField) {
            return false;
          }

          return (
            <Card testId="custom-card">
              <Heading>{exField.en}</Heading>
              <Paragraph>{exDesc.en}</Paragraph>
              <Button onClick={props.onEdit} style={{ marginRight: '10px' }}>
                Edit
              </Button>
              <Button onClick={props.onRemove}>Remove</Button>
            </Card>
          );
        }}
        sdk={sdk}
      />
    );

    findLinkExistingBtn().click();
    findCustomCards().should('have.length', 2);
  });

  it('renders default card instead of custom card', () => {
    const sdk = createReferenceEditorTestSdk();
    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        renderCustomCard={(props) => {
          const entity = props.entity as Entry;
          const { exField, exDesc } = entity.fields;

          if (!exField) {
            return false;
          }

          return (
            <Card testId="custom-card">
              <Heading>{exField.en}</Heading>
              <Paragraph>{exDesc.en}</Paragraph>
              <Button onClick={props.onEdit} style={{ marginRight: '10px' }}>
                Edit
              </Button>
              <Button onClick={props.onRemove}>Remove</Button>
            </Card>
          );
        }}
        sdk={sdk}
      />
    );

    findLinkExistingBtn().click();
    findLinkExistingBtn().click(); // Inserts another card using standard card renderer.
    findDefaultCards().should('have.length', 1);
    findCustomCards().should('have.length', 2);
  });

  it('hides actions when max number of allowed links is reached', () => {
    const sdk = createReferenceEditorTestSdk({ validations: [{ size: { max: 3 } }] });
    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        renderCustomCard={(props) => {
          const entity = props.entity as Entry;
          const { exField, exDesc } = entity.fields;

          if (!exField) {
            return false;
          }

          return (
            <Card testId="custom-card">
              <Heading>{exField.en}</Heading>
              <Paragraph>{exDesc.en}</Paragraph>
              <Button onClick={props.onEdit} style={{ marginRight: '10px' }}>
                Edit
              </Button>
              <Button onClick={props.onRemove}>Remove</Button>
            </Card>
          );
        }}
        sdk={sdk}
      />
    );

    findLinkExistingBtn().click(); // inserts 2 cards
    findLinkExistingBtn().click(); // inserts 1 card
    findLinkExistingBtn().should('not.exist'); // limit reached, button hidden.
  });
});
