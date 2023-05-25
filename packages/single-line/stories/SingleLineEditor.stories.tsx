import React from 'react';

import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { SingleLineEditor } from '../src/SingleLineEditor';

const meta: Meta<typeof SingleLineEditor> = {
  title: 'editors/Single Line',
  component: SingleLineEditor,
};

export default meta;

type Story = StoryObj<typeof SingleLineEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    const locales = createFakeLocalesAPI();
    return (
      <div>
        <SingleLineEditor field={field} locales={locales} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
