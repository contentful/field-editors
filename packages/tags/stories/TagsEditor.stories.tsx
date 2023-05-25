import React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { TagsEditor } from '../src/TagsEditor';

const meta: Meta<typeof TagsEditor> = {
  title: 'editors/Tags',
  component: TagsEditor,
};

export default meta;

type Story = StoryObj<typeof TagsEditor>;

export const EmptyInitialValue: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div>
        {/* @ts-expect-error */}
        <TagsEditor field={field} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const NonEmptyInitialValue: Story = {
  render: () => {
    const [field] = createFakeFieldAPI((mock) => mock, ['test1', 'test2', 'test3']);
    return (
      <>
        {/* @ts-expect-error */}
        <TagsEditor field={field} isInitiallyDisabled={false} />
      </>
    );
  },
};

export const Constraints: Story = {
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
        {/* @ts-expect-error */}
        <TagsEditor field={field} isInitiallyDisabled={false} />
      </>
    );
  },
};
