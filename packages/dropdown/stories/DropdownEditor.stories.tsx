import React from 'react';

import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { DropdownEditor } from '../src/DropdownEditor';

const meta: Meta<typeof DropdownEditor> = {
  title: 'editors/Dropdown',
  component: DropdownEditor,
};

export default meta;

type Story = StoryObj<typeof DropdownEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI((mock) => {
      return {
        ...mock,
        validations: [{ in: ['banana', 'orange', 'strawberry'] }],
      };
    });
    return (
      <div>
        <DropdownEditor
          field={field}
          locales={createFakeLocalesAPI()}
          isInitiallyDisabled={false}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
