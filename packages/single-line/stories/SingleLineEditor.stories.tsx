import * as React from 'react';

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
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
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

export const CharValidationDisabled: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    const locales = createFakeLocalesAPI();

    return (
      <div>
        <SingleLineEditor
          field={field}
          locales={locales}
          isInitiallyDisabled={false}
          withCharValidation={false}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const WithCharInformationDisabled: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    const locales = createFakeLocalesAPI();

    return (
      <div>
        <SingleLineEditor
          isInitiallyDisabled={false}
          withCharInformation={false}
          field={field}
          locales={locales}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
