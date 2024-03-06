import * as React from 'react';

import { Flex } from '@contentful/f36-components';
import { ActionsPlayground } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { ExternalResource, ExternalResourceCard, ResourceType } from '../src';
import { newReferenceEditorFakeSdk } from '../src/__fixtures__/FakeSdk';

const meta: Meta<typeof ExternalResourceCard> = {
  title: 'editors/externalResourceCard',
  component: ExternalResourceCard,
};

export default meta;

type Story = StoryObj<typeof ExternalResourceCard>;

const resource: ExternalResource = {
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
      url: 'https://picsum.photos/200/300 ',
    },
    badge: {
      label: 'primary',
      variant: 'primary',
    },
  },
};

const resourceType: ResourceType = {
  sys: {
    type: 'ResourceType',
    id: 'Shopify:Product',
    resourceProvider: {
      sys: {
        id: 'Shopify',
        type: 'Link',
        linkType: 'ResourceProvider',
      },
    },
  },
  name: 'Shopify product',
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
        <ExternalResourceCard info={{ resource, resourceType }} isDisabled={isInitiallyDisabled} />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const WithEditActions: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const mitt = newReferenceEditorFakeSdk()[1];
    return (
      <div>
        <ExternalResourceCard
          info={{ resource, resourceType }}
          isDisabled={isInitiallyDisabled}
          onRemove={() => {
            console.log('Removed');
          }}
          onEdit={() => {
            console.log('edited');
          }}
          hasCardEditActions={true}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const WithMultipleCardsHavingMultipleStatuses: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const mitt = newReferenceEditorFakeSdk()[1];
    return (
      <div>
        <Flex flexDirection="column" gap="spacingS">
          {(['positive', 'negative', 'primary', 'secondary', 'warning'] as const).map((variant) => (
            <ExternalResourceCard
              key={variant}
              info={{
                resource: {
                  ...resource,
                  fields: { ...resource.fields, badge: { variant, label: variant } },
                },
                resourceType,
              }}
              isDisabled={isInitiallyDisabled}
              onRemove={() => {
                console.log('Removed');
              }}
              onEdit={() => {
                console.log('edited');
              }}
              hasCardEditActions={true}
            />
          ))}
        </Flex>
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
