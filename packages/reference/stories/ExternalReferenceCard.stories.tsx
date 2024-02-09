import * as React from 'react';

import { ActionsPlayground } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { ExternalResourceCard } from '../src';
import { newReferenceEditorFakeSdk } from '../src/__fixtures__/FakeSdk';

const meta: Meta<typeof ExternalResourceCard> = {
  title: 'editors/externalResourceCard',
  component: ExternalResourceCard,
};

export default meta;

type Story = StoryObj<typeof ExternalResourceCard>;
const entity = {
  sys: {
    type: 'Resource',
    id: 'RandomId',
    resourceProvider: {
      sys: {
        id: 'Shopify',
        type: 'Link',
        linkType: 'ResourceProvider',
      },
    },
    resourceType: {
      sys: {
        id: 'Shopify:Product',
        type: 'Link',
        linkType: 'ResourceType',
      },
    },
  },
  fields: {
    title: 'dress',
    description: 'This is a nice dress',
    externalUrl: 'https://shopify.com/dress123',
    image: {
      url: 'shopify.com/dress.png',
    },
    additionalData: {
      sku: 123,
    },
  },
};

export const Default: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const mitt = newReferenceEditorFakeSdk()[1];
    return (
      <div>
        <ExternalResourceCard entity={entity} isDisabled={isInitiallyDisabled} size={'auto'} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
