import * as React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { NumberEditor } from '../src/NumberEditor';

const meta: Meta<typeof NumberEditor> = {
  title: 'editors/Number',
  component: NumberEditor,
};

export default meta;

type Story = StoryObj<typeof NumberEditor>;

export const Default: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div>
        <NumberEditor field={field} isInitiallyDisabled={false} id="number-field-edtior-default" />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
