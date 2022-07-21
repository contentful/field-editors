import React from 'react';

import { MultipleEntryReferenceEditor } from '../../../packages/reference/src';
import { newReferenceEditorFakeSdk } from '../../../packages/reference/src/__fixtures__/FakeSdk';
import { mount } from '../context';
import { ReferenceEditorProps } from '../../../packages/reference/src/common/ReferenceEditor';
import { Card, Heading, Paragraph, Button } from '@contentful/f36-components';
import { Entry } from '@contentful/field-editor-shared';

const wrappedTestId = 'multiple-entry-references-editor';
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
} as ReferenceEditorProps;

describe('Multiple Reference Editor', () => {
  const getWrapper = () =>
    cy.findByTestId(wrappedTestId);
  const findLinkExistingBtn = () => getWrapper().findByTestId('linkEditor.linkExisting');
  const findCustomCards = () => getWrapper().findAllByTestId('custom-card');
  const findDefaultCards = () => getWrapper().findAllByTestId('cf-ui-entry-card');

  function localMount(node: React.ReactNode) {
    mount(<div key={wrappedTestId} data-test-id={wrappedTestId}>{node}</div>);
  }

  it('is empty by default', () => {
    const [sdk] = newReferenceEditorFakeSdk();
    localMount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        sdk={sdk}
      />);
    findCustomCards().should('not.exist');
    findLinkExistingBtn().should('be.enabled');
  });

  it('renders custom cards', () => {
    const [sdk] = newReferenceEditorFakeSdk();

    localMount(
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
    const [sdk] = newReferenceEditorFakeSdk();

    localMount(
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

  it.only('hides actions when max number of allowed links is reached', () => {

    const [sdk] = newReferenceEditorFakeSdk({ validations: [{ size: { max: 3 } }] });
    localMount(
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
