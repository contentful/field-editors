import React from 'react';

import { Asset, Button, Card, Heading } from '@contentful/f36-components';
import { ActionsPlayground } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { CombinedLinkActions, MultipleMediaEditor } from '../src';
import { newReferenceEditorFakeSdk } from '../src/__fixtures__/FakeSdk';

const meta: Meta<typeof MultipleMediaEditor> = {
  title: 'editors/Multiple Media',
  component: MultipleMediaEditor,
};

export default meta;

type Story = StoryObj<typeof MultipleMediaEditor>;

export const Default: Story = {
  render: () => {
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div data-test-id="multiple-media-editor-integration-test">
        <MultipleMediaEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={false}
          parameters={{
            instance: {
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

export const Link: Story = {
  render: () => {
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <MultipleMediaEditor
          viewType="link"
          sdk={sdk}
          isInitiallyDisabled={false}
          parameters={{
            instance: {
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
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div data-test-id="multiple-media-editor-custom-actions-integration-test">
        <MultipleMediaEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={false}
          renderCustomActions={(props) => <CombinedLinkActions {...props} />}
          parameters={{
            instance: {
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
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div data-test-id="multiple-media-editor-custom-cards-integration-test">
        <MultipleMediaEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={false}
          parameters={{
            instance: {
              showCreateEntityAction: true,
              showLinkEntityAction: true,
            },
          }}
          renderCustomCard={(props) => {
            const title = props.entity.fields.title;
            if (!title) {
              return false;
            }
            const file = props.entity.fields.file;
            return (
              <Card testId="custom-card">
                <Heading>{title && title['en-US']}</Heading>
                <Asset
                  src={file && file['en-US'].url}
                  title={file && file['en-US'].fileName}
                  style={{ width: 100, height: 100, marginBottom: '10px' }}
                />
                <Button onClick={props.onEdit} style={{ marginRight: '10px' }}>
                  Edit
                </Button>
                <Button onClick={props.onRemove}>Remove</Button>
              </Card>
            );
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
