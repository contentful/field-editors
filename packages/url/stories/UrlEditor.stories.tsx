import React from 'react';

import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { UrlEditor } from '../src/UrlEditor';

const meta: Meta<typeof UrlEditor> = {
  title: 'editors/Url',
  component: UrlEditor,
};

export default meta;

type Story = StoryObj<typeof UrlEditor>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI();
    return (
      <div>
        <UrlEditor field={field} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const Custom: Story = {
  render: () => {
    const [field] = createFakeFieldAPI(
      (_) => _,
      'https://d21buns5ku92am.cloudfront.net/41748/images/347873-Mark_Circular_white_no%20shadow-3d0a86-large-1582585736.png'
    );
    return (
      <UrlEditor field={field} isInitiallyDisabled={false}>
        {({ value }) => (
          <div style={{ marginTop: 20 }}>
            <img src={value as string} width="50%" alt="" />
          </div>
        )}
      </UrlEditor>
    );
  },
};
