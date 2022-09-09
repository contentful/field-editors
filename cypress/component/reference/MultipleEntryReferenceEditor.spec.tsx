import React from 'react';

import { NavigatorSlideInfo } from '@contentful/app-sdk';
import { Button, Card, Heading, Note, Paragraph } from '@contentful/f36-components';
import { Entry } from '@contentful/field-editor-shared';
import { cloneDeep, set } from 'lodash-es';

import { CombinedLinkActions, MultipleEntryReferenceEditor } from '../../../packages/reference/src';
import { Entity, Link } from '../../../packages/reference/src/types';
import {
  createReferenceEditorTestSdk,
  fixtures,
  ReferenceEditorFakeSdkProps,
} from '../../fixtures';
import { mount } from '../mount';

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

function modifyEntry(entry: Entry, modifier: Record<string, unknown>): Entry {
  const modified = Object.entries(modifier).reduce(
    (entry, [path, value]) => set(entry, path, value),
    cloneDeep(entry)
  );

  return modified;
}

describe('Multiple Reference Editor', () => {
  const findLinkExistingBtn = () => cy.findByTestId('linkEditor.linkExisting');
  // const findCreateLinkBtn = () => cy.findByTestId('create-entry-link-button');
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
        asLink(fixtures.entries.empty),
        asLink(fixtures.entries.changed),
        asLink(fixtures.entries.published),
      ],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    cy.findAllByTestId('cf-ui-entry-card').should('have.length', 3);
    cy.findAllByTestId('cf-ui-entry-card').eq(0).findByText('draft').should('be.visible');
    cy.findAllByTestId('cf-ui-entry-card').eq(1).findByText('changed').should('be.visible');
    cy.findAllByTestId('cf-ui-entry-card').eq(2).findByText('published').should('be.visible');
  });

  //TODO: Do we also want to test that the props are correct, or should that be done in a jest test?
  it(`provides the custom card render method with necessary properties`, () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published)],
    });
    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        renderCustomCard={() => {
          return <Note testId="custom-card" title="Custom card" />;
        }}
        sdk={sdk}
      />
    );

    cy.findByTestId('custom-card').should('be.visible');
  });

  it('shows localized displayField as title using the current locale', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published)],
    });
    sdk.field.locale = 'de-DE';
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    findDefaultCards()
      .eq(0)
      .findByTestId('title')
      .should('have.text', 'Der beste Artikel aller Zeiten');
  });

  it('shows unlocalized displayField as title using the default locale', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    findDefaultCards().eq(0).findByTestId('title').should('have.text', 'The best article ever');
  });

  it('shows missing entry card for failed requests', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.invalid)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    cy.findByText('Entry is missing or inaccessible').should('be.visible');
  });

  it('shows loading state while fetching entry', () => {
    const sdk = createReferenceEditorTestSdk({
      fetchDelay: 2000,
      initialValue: [asLink(fixtures.entries.published)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    cy.findByTestId('cf-ui-skeleton-form').should('be.visible');
  });

  it('custom action props reach render method', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published)],
    });
    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        renderCustomActions={(props) => {
          return <CombinedLinkActions {...props} />;
        }}
        sdk={sdk}
      />
    );

    cy.findByTestId('link-actions-menu-trigger').should('be.visible');
  });

  it('custom missing entity card props reach render method', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.invalid)],
    });
    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        renderCustomMissingEntityCard={() => {
          return <Note testId="custom-missing-entry-card" title="Custom missing entry card" />;
        }}
        sdk={sdk}
      />
    );

    cy.findByTestId('custom-missing-entry-card').should('be.visible');
  });

  it('opens entry when clicking on it', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />).as('editor');

    cy.spy(sdk.navigator, 'openEntry').as('spy');

    findDefaultCards().eq(0).findByTestId('title').click();

    cy.get('@spy').should('have.been.calledOnce');
  });

  it('opens entry via actions menu', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />).as('editor');

    cy.spy(sdk.navigator, 'openEntry').as('spy');

    findDefaultCards().eq(0).findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('edit').click();

    cy.get('@spy').should('have.been.calledOnce');
  });

  it('changes order via actions menu', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published), asLink(fixtures.entries.changed)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />).as('editor');

    findDefaultCards().eq(0).as('firstCard');

    cy.get('@firstCard').findByTestId('title').should('have.text', 'The best article ever');

    cy.get('@firstCard').findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('move-bottom').click();
    cy.wait(500);

    findDefaultCards().eq(1).findByTestId('title').should('have.text', 'The best article ever');
  });

  it('removes items via actions menu', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published), asLink(fixtures.entries.changed)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} sdk={sdk} />);

    findDefaultCards().eq(0).as('firstCard');

    cy.get('@firstCard').findByTestId('title').should('have.text', 'The best article ever');

    cy.get('@firstCard').findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('delete').click();
    cy.wait(500);

    findDefaultCards().eq(0).findByTestId('title').should('have.text', `Weather doesn't look good`);
  });

  //TODO: Currently fails
  // it('shows disabled links as disabled', () => {
  //   const sdk = createReferenceEditorTestSdk({
  //     initialValue: [asLink(fixtures.entries.published)],
  //   });
  //   mount(<MultipleEntryReferenceEditor {...commonProps} isInitiallyDisabled={true} sdk={sdk} />);

  //   findLinkExistingBtn().should('be.disabled');
  //   findCreateLinkBtn().should('be.disabled');

  //   findDefaultCards().eq(0).findByTestId('cf-ui-card-actions').should('be.disabled');
  // });

  it('shows disabled links as non-draggable', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published)],
    });
    mount(<MultipleEntryReferenceEditor {...commonProps} isInitiallyDisabled={true} sdk={sdk} />);

    findDefaultCards().eq(0).findByTestId('cf-ui-drag-handle').should('not.exist');
  });

  it('can hide edit action', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published), asLink(fixtures.entries.changed)],
    });

    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        hasCardEditActions={false}
        isInitiallyDisabled={true}
        sdk={sdk}
      />
    );

    findDefaultCards().eq(0).findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('edit').should('not.exist');
  });

  it('can hide remove action', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published), asLink(fixtures.entries.changed)],
    });

    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        hasCardRemoveActions={false}
        isInitiallyDisabled={true}
        sdk={sdk}
      />
    );

    findDefaultCards().eq(0).findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('delete').should('not.exist');
  });

  it('can hide move action', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published), asLink(fixtures.entries.changed)],
    });

    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        hasCardMoveActions={false}
        isInitiallyDisabled={true}
        sdk={sdk}
      />
    );

    findDefaultCards().eq(0).findByTestId('cf-ui-card-actions').click();
    cy.findByTestId('move-bottom').should('not.exist');
  });

  it('hides action menu when no actions are available', () => {
    const sdk = createReferenceEditorTestSdk({
      initialValue: [asLink(fixtures.entries.published), asLink(fixtures.entries.changed)],
    });

    mount(
      <MultipleEntryReferenceEditor
        {...commonProps}
        hasCardEditActions={false}
        hasCardMoveActions={false}
        hasCardRemoveActions={false}
        isInitiallyDisabled={true}
        sdk={sdk}
      />
    );

    findDefaultCards().eq(0).findByTestId('cf-ui-card-actions').should('not.exist');
  });

  describe(`behaviour on external changes`, () => {
    function updateEntry(entry: Entry, title: string) {
      cy.getComponentFixtures().then(({ pubsub }) => {
        const updatedEntry = modifyEntry(entry, {
          'sys.version': entry.sys.version + 2,
          'fields.exField.en-US': title,
        });
        pubsub.entityChanged('Entry', updatedEntry.sys.id, updatedEntry);
      });
    }

    function localMount(entry: Entry, props?: ReferenceEditorFakeSdkProps) {
      const sdk = createReferenceEditorTestSdk({
        initialValue: [asLink(entry)],
        ...props,
      });
      mount(
        <MultipleEntryReferenceEditor
          {...commonProps}
          hasCardEditActions={false}
          hasCardMoveActions={false}
          hasCardRemoveActions={false}
          isInitiallyDisabled={false}
          sdk={sdk}
        />
      );
    }

    it(`updates cards in un-aliased environment`, () => {
      localMount(fixtures.entries.published);

      const initialTitle = fixtures.entries.published.fields.exField['en-US'];
      const updatedTitle = initialTitle + ' [updated]';

      cy.findByText(initialTitle);
      updateEntry(fixtures.entries.published, updatedTitle);
      cy.findByText(updatedTitle);
    });

    it(`updates cards in aliased environment`, () => {
      localMount(fixtures.entries.published, {
        ids: {
          environment: 'master-2511',
          environmentAlias: 'master',
          space: 'space-id',
        },
      });

      const initialTitle = fixtures.entries.published.fields.exField['en-US'];
      const updatedTitle = initialTitle + ' [updated]';

      cy.findByText(initialTitle);
      updateEntry(fixtures.entries.published, updatedTitle);
      cy.findByText(updatedTitle);
    });
  });

  describe(`behaviour on slideInNavigation`, () => {
    function updateAndSlideIn(entry: Entry, title: string, slide: NavigatorSlideInfo) {
      cy.getComponentFixtures().then(({ store, navigator }) => {
        const updatedEntry = modifyEntry(entry, {
          'sys.version': entry.sys.version + 2,
          'fields.exField.en-US': title,
        });
        store.set('Entry', updatedEntry.sys.id, updatedEntry);
        navigator.slideIn(slide);
      });
    }

    function localMount(entry: Entry) {
      const sdk = createReferenceEditorTestSdk({
        initialValue: [asLink(entry)],
        modifier: (sdk) => {
          // @ts-expect-error ...
          sdk.space.onEntityChanged = undefined;
          return sdk;
        },
      });
      mount(
        <MultipleEntryReferenceEditor
          {...commonProps}
          hasCardEditActions={false}
          hasCardMoveActions={false}
          hasCardRemoveActions={false}
          isInitiallyDisabled={false}
          sdk={sdk}
        />
      );
    }

    it(`updates cards if slide is closed`, () => {
      const entry = fixtures.entries.published;
      const initialTitle = entry.fields.exField['en-US'];
      const updatedTitle = initialTitle + ' [updated]';

      localMount(entry);

      cy.findByText(initialTitle);
      updateAndSlideIn(entry, updatedTitle, { oldSlideLevel: 2, newSlideLevel: 1 });
      cy.findByText(updatedTitle);
    });

    it(`does not update cards if slide is opened`, () => {
      const entry = fixtures.entries.published;
      const initialTitle = entry.fields.exField['en-US'];
      const updatedTitle = initialTitle + ' [updated]';

      localMount(entry);

      cy.findByText(initialTitle);
      updateAndSlideIn(entry, updatedTitle, { oldSlideLevel: 1, newSlideLevel: 2 });
      cy.findByText(updatedTitle).should('not.exist');
      cy.findByText(initialTitle).should('exist');
    });
  });
});
