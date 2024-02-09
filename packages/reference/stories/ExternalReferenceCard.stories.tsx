import * as React from 'react';

import { Flex } from '@contentful/f36-components';
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

const activeEntity = {
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
    additionalData: {
      sku: 123,
      status: 'active',
    },
  },
};

const draftEntity = {
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
    additionalData: {
      sku: 123,
      status: 'draft',
    },
  },
};

const archivedEntity = {
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
    additionalData: {
      sku: 123,
      status: 'archived',
    },
  },
};

const suspendedEntity = {
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
    additionalData: {
      sku: 123,
      status: 'suspended',
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
        <ExternalResourceCard
          entity={activeEntity}
          isDisabled={isInitiallyDisabled}
          size={'auto'}
        />
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
          entity={activeEntity}
          isDisabled={isInitiallyDisabled}
          onRemove={() => {
            console.log('Removed');
          }}
          onEdit={() => {
            console.log('edited');
          }}
          hasCardEditActions={true}
          size={'auto'}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};

export const WithEMultipleCardsHavingMultipleStatuses: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const mitt = newReferenceEditorFakeSdk()[1];
    return (
      <div>
        <Flex flexDirection="column" gap="spacingS">
          <ExternalResourceCard
            entity={activeEntity}
            isDisabled={isInitiallyDisabled}
            onRemove={() => {
              console.log('Removed');
            }}
            onEdit={() => {
              console.log('edited');
            }}
            hasCardEditActions={true}
            size={'auto'}
          />
          <ExternalResourceCard
            entity={draftEntity}
            isDisabled={isInitiallyDisabled}
            onRemove={() => {
              console.log('Removed');
            }}
            onEdit={() => {
              console.log('edited');
            }}
            hasCardEditActions={true}
            size={'auto'}
          />
          <ExternalResourceCard
            entity={archivedEntity}
            isDisabled={isInitiallyDisabled}
            onRemove={() => {
              console.log('Removed');
            }}
            onEdit={() => {
              console.log('edited');
            }}
            hasCardEditActions={true}
            size={'auto'}
          />
          <ExternalResourceCard
            entity={suspendedEntity}
            isDisabled={isInitiallyDisabled}
            onRemove={() => {
              console.log('Removed');
            }}
            onEdit={() => {
              console.log('edited');
            }}
            hasCardEditActions={true}
            size={'auto'}
          />
        </Flex>
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
