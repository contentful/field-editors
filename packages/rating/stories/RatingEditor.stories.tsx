import React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { RatingEditor } from '../src/RatingEditor';

const meta: Meta<typeof RatingEditor> = {
  title: 'editors/Rating',
  component: RatingEditor,
};

export default meta;

type Story = StoryObj<typeof RatingEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div>
        <RatingEditor field={field} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [field] = createFakeFieldAPI();
    return <RatingEditor field={field} isInitiallyDisabled />;
  },
};

export const MoreStars: Story = {
  render: () => {
    const [field] = createFakeFieldAPI();
    return (
      <RatingEditor
        field={field}
        isInitiallyDisabled={false}
        parameters={{ instance: { stars: 20 } }}
      />
    );
  },
};
