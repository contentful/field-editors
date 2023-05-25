import React from 'react';

import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { CheckboxEditor } from '../src/CheckboxEditor';

const meta: Meta<typeof CheckboxEditor> = {
  title: 'editors/Checkbox',
  component: CheckboxEditor,
};

export default meta;

type Story = StoryObj<typeof CheckboxEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI(
      // @ts-expect-error
      (mock) => ({
        ...mock,
        items: {
          validations: [{ in: ['test1', 'test2', 'test3', 'test4'] }],
        },
      }),
      ['test1', 'test2', 'test3']
    );
    return (
      <div>
        <CheckboxEditor
          field={field}
          locales={createFakeLocalesAPI()}
          isInitiallyDisabled={false}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
