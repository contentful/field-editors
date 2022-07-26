import React from 'react';

import { Card, Note, Heading, Paragraph, Button } from '@contentful/f36-components';
import { Entry } from '@contentful/field-editor-shared';

import { MultipleEntryReferenceEditor } from '../../../packages/reference/src';
import { Entity, Link } from '../../../packages/reference/src/types';
import { mount } from '../mount';
import { createReferenceEditorTestSdk, fixtures } from '../test-sdks';

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

function asLink<E extends Entity>(entity: E): Link {
  return { sys: { type: 'Link', linkType: entity.sys.type, id: entity.sys.id } };
}

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

  it(`shows status of entries`, () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [
        asLink(fixtures.entry.empty),
        asLink(fixtures.entry.changed),
        asLink(fixtures.entry.published),
      ],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    cy.findAllByTestId('cf-ui-entry-card').should('have.length', 3);
    cy.findAllByTestId('cf-ui-entry-card').eq(0).findByText('draft').should('be.visible');
    cy.findAllByTestId('cf-ui-entry-card').eq(1).findByText('changed').should('be.visible');
    cy.findAllByTestId('cf-ui-entry-card').eq(2).findByText('published').should('be.visible');
  });

  it(`provides the custom card render method with necessary properties`, () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entry.published)],
    });
    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        renderCustomCard={(props) => {
          cy.wrap(props).as('customCardProps');

          return <Note testId="custom-card" title="Custom card" />;
        }}
        sdk={sdk}
      />
    );

    cy.findByTestId('custom-card').should('be.visible');
    cy.get('@customCardProps').should('deep.equal', {
      index: 0,
      size: 'small',
    });
  });

  // prio 1
  // ------
  // shows localized displayField as title using the current locale
  // shows unlocalized displayField as title using the default locale
  // shows status of entries
  // shows missing entry card for failed requests
  // shows loading state while fetching entry
  // custom card props reach render method
  // custom action props reach render method
  // custom missing entity card props reach render method
  // opens entry when clicking on it
  // opens entry via actions menu
  // changing order via actions menu
  // removing items via actions menu

  // prio ?
  // ------
  // does not show nil values from list of links, e.g. [{ sys: { id: '...'} }, null, undefined]
  // shows disabled links as non-draggable
  // shows asset in tile view
  // changing order by drag&drop
  // shows predefined labels
  // shows custom labels
  // can hide edit/move/remove/actions
  // can render as list
  // can render as tiles
});
