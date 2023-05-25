import React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { LocationEditorConnected as LocationEditor } from '../src/LocationEditor';

const meta: Meta<typeof LocationEditor> = {
  title: 'editors/Location',
  component: LocationEditor,
};

export default meta;

type Story = StoryObj<typeof LocationEditor>;

export const Default: Story = {
  render: () => {
    const initialValue = window.localStorage.getItem('initialValue');
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const [field, mitt] = createFakeFieldAPI(
      (field) => field,
      initialValue ? JSON.parse(initialValue) : undefined
    );
    return (
      <div data-test-id="location-editor-integration-test">
        <LocationEditor
          field={field}
          isInitiallyDisabled={isInitiallyDisabled ?? false}
          parameters={{
            instance: {
              googleMapsKey: window.localStorage.getItem('googleMapsKey'),
            },
          }}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
