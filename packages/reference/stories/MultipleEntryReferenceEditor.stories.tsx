import React from 'react';

import { Button, Card, Heading, Paragraph } from '@contentful/f36-components';
import { ActionsPlayground } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { CombinedLinkActions, MultipleEntryReferenceEditor } from '../src';
import { newReferenceEditorFakeSdk } from '../src/__fixtures__/FakeSdk';

const meta: Meta<typeof MultipleEntryReferenceEditor> = {
  title: 'editors/Multiple Entry',
  component: MultipleEntryReferenceEditor,
};

export default meta;

type Story = StoryObj<typeof MultipleEntryReferenceEditor>;

export const Default: Story = {
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <MultipleEntryReferenceEditor
          hasCardEditActions={false}
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: instanceParams || {
              showCreateEntityAction: true,
              showLinkEntityAction: true,
            },
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const CustomCard: Story = {
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div data-test-id="multiple-references-editor-custom-cards-integration-test">
        <MultipleEntryReferenceEditor
          hasCardEditActions={false}
          renderCustomCard={(props) =>
            props.entity.fields.exField ? (
              <Card testId="custom-card">
                <Heading>{props.entity.fields.exField.en}</Heading>
                <Paragraph>{props.entity.fields.exDesc.en}</Paragraph>
                <Button onClick={props.onEdit} style={{ marginRight: '10px' }}>
                  Edit
                </Button>
                <Button onClick={props.onRemove}>Remove</Button>
              </Card>
            ) : (
              false
            )
          }
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: instanceParams || {
              showCreateEntityAction: true,
              showLinkEntityAction: true,
            },
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const CustomActions: Story = {
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <MultipleEntryReferenceEditor
          hasCardEditActions={false}
          renderCustomActions={(props) => <CombinedLinkActions {...props} />}
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: instanceParams || {
              showCreateEntityAction: true,
              showLinkEntityAction: true,
            },
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const CustomActionsAndCustomLabel: Story = {
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <MultipleEntryReferenceEditor
          hasCardEditActions={false}
          renderCustomActions={(props) => (
            <CombinedLinkActions
              {...props}
              combinedActionsLabel="My custom label"
              onCreate={async (ct) => window.alert('clicked' + ct)}
            />
          )}
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: instanceParams || {
              showCreateEntityAction: true,
              showLinkEntityAction: true,
            },
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const CustomOnCreateOnLinkExistingActions: Story = {
  render: () => {
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div data-test-id="custom-card-using-default">
        <MultipleEntryReferenceEditor
          hasCardEditActions={false}
          renderCustomActions={(props) => (
            <CombinedLinkActions
              {...props}
              onCreate={async (ct) => {
                const entry = await sdk.space.createEntry(ct as string, {
                  fields: { exField: { en: 'Custom initial value' } },
                });

                props.onCreated(entry);
                await sdk.navigator.openEntry(entry.sys.id);
              }}
              onLinkExisting={async (index) => {
                const entries = await sdk.dialogs.selectMultipleEntries({
                  locale: sdk.field.locale,
                  contentTypes: ['exampleCT'],
                });

                if (entries && entries.length) {
                  window.alert(`Custom linking of ${entries.length} entries`);
                  props.onLinkedExisting(entries, index);
                }
              }}
            />
          )}
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={false}
          parameters={{
            instance: instanceParams || {
              showCreateEntityAction: true,
              showLinkEntityAction: true,
            },
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const CustomCardRelyingOnDefaultCard: Story = {
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div data-test-id="multiple-references-editor-custom-cards-with-default-integration-test">
        <MultipleEntryReferenceEditor
          hasCardEditActions={false}
          renderCustomCard={(props, _, renderDefaultCard) => {
            // @ts-expect-error
            return renderDefaultCard({ size: 'small' });
          }}
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: instanceParams || {
              showCreateEntityAction: true,
              showLinkEntityAction: true,
            },
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
