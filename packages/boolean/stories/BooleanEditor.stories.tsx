import * as React from 'react';

import { FormControl } from '@contentful/f36-components';
import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { BooleanEditor } from '../src/BooleanEditor';

const meta: Meta<typeof BooleanEditor> = {
  title: 'editors/Boolean',
  component: BooleanEditor,
};

export default meta;

type Story = StoryObj<typeof BooleanEditor>;

export const Default: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <FormControl as="fieldset" aria-label="Choose one">
        <BooleanEditor field={field} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </FormControl>
    );
  },
};
