import * as React from 'react';

import { Asset } from '@contentful/f36-asset';
import { Button } from '@contentful/f36-button';
import { ThumbUpIcon } from '@contentful/f36-icons';
import { TextLink } from '@contentful/f36-text-link';
import { Heading } from '@contentful/f36-typography';
import { ActionsPlayground } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { SingleMediaEditor } from '../src';
import { newReferenceEditorFakeSdk } from '../src/__fixtures__/FakeSdk';

const meta: Meta<typeof SingleMediaEditor> = {
  title: 'editors/Single Media',
  component: SingleMediaEditor,
};

export default meta;

type Story = StoryObj<typeof SingleMediaEditor>;

export const Default: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <SingleMediaEditor
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

export const CustomActions: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <SingleMediaEditor
          viewType="card"
          sdk={sdk}
          isInitiallyDisabled={false}
          renderCustomActions={(props) => (
            <TextLink
              isDisabled={props.isDisabled}
              testId="custom-link"
              onClick={props.onLinkExisting as any}
              variant="primary"
              icon={<ThumbUpIcon />}
              alignIcon="end">
              Re-use something
            </TextLink>
          )}
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
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [sdk, mitt] = newReferenceEditorFakeSdk();
    return (
      <div>
        <SingleMediaEditor
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
