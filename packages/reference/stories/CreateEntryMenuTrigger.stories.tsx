import * as React from 'react';

import { Button, Menu } from '@contentful/f36-components';
import { PlusIcon } from '@contentful/f36-icons';
import type { Meta, StoryObj } from '@storybook/react';

import { type ContentType, CreateEntryMenuTrigger } from '../src';

const mockContentTypes: ContentType[] = [
  {
    sys: { id: 'blogPost', type: 'ContentType' },
    name: 'Blog Post',
    fields: [],
  } as unknown as ContentType,
  {
    sys: { id: 'article', type: 'ContentType' },
    name: 'Article',
    fields: [],
  } as unknown as ContentType,
  {
    sys: { id: 'page', type: 'ContentType' },
    name: 'Page',
    fields: [],
  } as unknown as ContentType,
  {
    sys: { id: 'product', type: 'ContentType' },
    name: 'Product',
    fields: [],
  } as unknown as ContentType,
];

const mockContentTypesWithSearch: ContentType[] = [
  ...mockContentTypes,
  {
    sys: { id: 'category', type: 'ContentType' },
    name: 'Category',
    fields: [],
  } as unknown as ContentType,
  {
    sys: { id: 'author', type: 'ContentType' },
    name: 'Author',
    fields: [],
  } as unknown as ContentType,
  {
    sys: { id: 'video', type: 'ContentType' },
    name: 'Video',
    fields: [],
  } as unknown as ContentType,
];

const meta: Meta<typeof CreateEntryMenuTrigger> = {
  title: 'editors/Create Entry Menu Trigger',
  component: CreateEntryMenuTrigger,
};

export default meta;

type Story = StoryObj<typeof CreateEntryMenuTrigger>;

export const Default: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <CreateEntryMenuTrigger
        contentTypes={mockContentTypes}
        onSelect={handleSelect}
        testId="create-entry-menu-default"
      >
        {({ isSelecting }) => (
          <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
            Add entry
          </Button>
        )}
      </CreateEntryMenuTrigger>
    );
  },
};

export const WithSuggestedContentType: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <CreateEntryMenuTrigger
        contentTypes={mockContentTypes}
        suggestedContentTypeId="blogPost"
        onSelect={handleSelect}
        testId="create-entry-menu-suggested"
      >
        {({ isSelecting }) => (
          <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
            Add entry
          </Button>
        )}
      </CreateEntryMenuTrigger>
    );
  },
};

export const WithSearch: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <CreateEntryMenuTrigger
        contentTypes={mockContentTypesWithSearch}
        onSelect={handleSelect}
        testId="create-entry-menu-search"
      >
        {({ isSelecting }) => (
          <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
            Add entry
          </Button>
        )}
      </CreateEntryMenuTrigger>
    );
  },
};

export const WithCustomDropdownItems: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <CreateEntryMenuTrigger
        contentTypes={mockContentTypes}
        onSelect={handleSelect}
        testId="create-entry-menu-custom-items"
        customDropdownItems={
          <>
            <Menu.SectionTitle>Quick Actions</Menu.SectionTitle>
            <Menu.Item onClick={() => console.log('Import clicked')}>
              Import from template
            </Menu.Item>
            <Menu.Item onClick={() => console.log('Duplicate clicked')}>
              Duplicate last entry
            </Menu.Item>
          </>
        }
      >
        {({ isSelecting }) => (
          <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
            Add entry
          </Button>
        )}
      </CreateEntryMenuTrigger>
    );
  },
};

export const SingleContentType: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <CreateEntryMenuTrigger
        contentTypes={[mockContentTypes[0]]}
        onSelect={handleSelect}
        testId="create-entry-menu-single"
      >
        {({ isSelecting }) => (
          <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
            Add Blog Post
          </Button>
        )}
      </CreateEntryMenuTrigger>
    );
  },
};

export const WithCustomLabel: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <CreateEntryMenuTrigger
        contentTypes={mockContentTypes}
        contentTypesLabel="Available Types"
        onSelect={handleSelect}
        testId="create-entry-menu-custom-label"
      >
        {({ isSelecting }) => (
          <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
            Add entry
          </Button>
        )}
      </CreateEntryMenuTrigger>
    );
  },
};

export const RightAligned: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
        <CreateEntryMenuTrigger
          contentTypes={mockContentTypes}
          onSelect={handleSelect}
          testId="create-entry-menu-right"
          dropdownSettings={{
            position: 'bottom-right',
            isAutoalignmentEnabled: false,
          }}
        >
          {({ isSelecting }) => (
            <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
              Add entry
            </Button>
          )}
        </CreateEntryMenuTrigger>
      </div>
    );
  },
};

export const WithCustomButtonAndSearch: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const handleSelect = async (contentTypeId: string) => {
      console.log('Selected content type:', contentTypeId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    };

    const handleImportTemplate = () => {
      console.log('Import from template clicked');
      window.alert('Import from template functionality');
    };

    return (
      <CreateEntryMenuTrigger
        contentTypes={mockContentTypesWithSearch}
        onSelect={handleSelect}
        testId="create-entry-menu-custom-button-search"
        customDropdownItems={
          <Button
            startIcon={<PlusIcon />}
            variant="secondary"
            size="small"
            onClick={handleImportTemplate}
            style={{ width: '-webkit-fill-available', margin: '8px' }}
          >
            Add existing entry
          </Button>
        }
      >
        {({ isSelecting }) => (
          <Button startIcon={<PlusIcon />} variant="primary" isLoading={isSelecting}>
            Add entry
          </Button>
        )}
      </CreateEntryMenuTrigger>
    );
  },
};
