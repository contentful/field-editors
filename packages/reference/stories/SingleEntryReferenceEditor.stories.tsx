import React from 'react';

import { Button, Card, Heading, Paragraph } from '@contentful/f36-components';
import { ActionsPlayground } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { SingleEntryReferenceEditor } from '../src';
import { newReferenceEditorFakeSdk } from '../src/__fixtures__/FakeSdk';

const meta: Meta<typeof SingleEntryReferenceEditor> = {
  title: '/editors/reference/SingleEntry',
  component: SingleEntryReferenceEditor,
};

export default meta;

type Story = StoryObj<typeof SingleEntryReferenceEditor>;

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
        <SingleEntryReferenceEditor
          hasCardEditActions={false}
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={isInitiallyDisabled}
          parameters={{
            instance: instanceParams ?? {
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
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <SingleEntryReferenceEditor
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
    const instanceParams = JSON.parse(window.localStorage.getItem('instanceParams') as string) as {
      showCreateEntityAction: boolean;
      showLinkEntityAction: boolean;
    };
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div data-test-id="custom-card-using-default">
        <SingleEntryReferenceEditor
          hasCardEditActions={false}
          renderCustomCard={(props, _, renderDefaultCard) => {
            // @ts-expect-error
            return renderDefaultCard({ size: 'small' });
          }}
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={false}
          parameters={{
            instance: instanceParams ?? {
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
