import React from 'react';

import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { RadioEditor } from '../src/RadioEditor';

const meta: Meta<typeof RadioEditor> = {
  title: 'editors/Radio',
  component: RadioEditor,
};

export default meta;

type Story = StoryObj<typeof RadioEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI(
      (mock) => ({
        ...mock,
        type: 'Symbol',
        validations: [{ in: ['test1', 'test2', 'test3', 'test4'] }],
      }),
      ['test1', 'test2', 'test3']
    );
    return (
      <div>
        <RadioEditor field={field} locales={createFakeLocalesAPI()} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
