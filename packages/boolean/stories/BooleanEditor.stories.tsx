import React from 'react';

import { createFakeFieldAPI, ActionsPlayground } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import * as Editor from '../src/BooleanEditor';

const meta: Meta<typeof Editor.BooleanEditor> = {
  title: 'editors/Boolean',
  component: Editor.BooleanEditor,
};

export default meta;

type Story = StoryObj<typeof Editor.BooleanEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div>
        <Editor.BooleanEditor field={field} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
