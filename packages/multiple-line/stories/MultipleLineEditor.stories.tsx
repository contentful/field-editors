import React from 'react';

import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { MultipleLineEditor } from '../src/MultipleLineEditor';

const meta: Meta<typeof MultipleLineEditor> = {
  title: 'editors/MultiLine',
  component: MultipleLineEditor,
};

export default meta;

type Story = StoryObj<typeof MultipleLineEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        type: 'Text',
      };
    });
    const locales = createFakeLocalesAPI();
    return (
      <div>
        <MultipleLineEditor field={field} locales={locales} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
