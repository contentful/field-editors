import React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { DateEditor } from '../src/DateEditor';

const meta: Meta<typeof DateEditor> = {
  title: 'editors/Date',
  component: DateEditor,
};

export default meta;

type Story = StoryObj<typeof DateEditor>;

export const Default: Story = {
  render: () => {
    const rawInitialValue = window.localStorage.getItem('initialValue');
    const initialValue = rawInitialValue ? JSON.parse(rawInitialValue) : undefined;
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const instanceParams = window.localStorage.getItem('instanceParams');
    const [field, mitt] = createFakeFieldAPI((field) => field, initialValue);
    return (
      <div data-test-id="date-editor-integration-test">
        <DateEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled ?? false}
          parameters={{
            instance: instanceParams ? JSON.parse(instanceParams) : {},
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
