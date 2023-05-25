import React from 'react';

import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { ListEditor } from '../src/ListEditor';

const meta: Meta<typeof ListEditor> = {
  title: 'editors/List',
  component: ListEditor,
};

export default meta;

type Story = StoryObj<typeof ListEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div>
        <ListEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const List: Story = {
  render: () => {
    const [field] = createFakeFieldAPI((mock) => mock, ['test1', 'test2', 'test3']);
    return (
      <ListEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
    );
  },
};
