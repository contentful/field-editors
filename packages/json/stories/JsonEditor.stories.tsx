import React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import JsonEditor from '../src/JsonEditor';

const meta: Meta<typeof JsonEditor> = {
  title: 'editors/Json',
  component: JsonEditor,
};

export default meta;

type Story = StoryObj<typeof JsonEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div data-test-id="json-editor-integration-test">
        <JsonEditor field={field} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
