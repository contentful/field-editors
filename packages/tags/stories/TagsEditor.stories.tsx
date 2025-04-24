import * as React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { TagsEditorContainer as TagsEditor } from '../src/TagsEditorContainer';

const meta: Meta<typeof TagsEditor> = {
  title: 'editors/Tags',
  component: TagsEditor,
};

export default meta;

type Story = StoryObj<typeof TagsEditor>;

export const EmptyInitialValue: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div>
        <TagsEditor field={field} isInitiallyDisabled={false} id="initial-empty-tags-editor" />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const NonEmptyInitialValue: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [field] = createFakeFieldAPI((mock) => mock, ['test1', 'test2', 'test3']);
    return (
      <>
        <TagsEditor field={field} isInitiallyDisabled={false} />
      </>
    );
  },
};

export const Constraints: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [field] = createFakeFieldAPI(
      (mock) => {
        return {
          ...mock,
          validations: [{ size: { min: 3, max: 20 } }],
        };
      },
      ['test1', 'test2', 'test3']
    );
    return (
      <>
        <TagsEditor field={field} isInitiallyDisabled={false} />
      </>
    );
  },
};
