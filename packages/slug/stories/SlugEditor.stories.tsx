/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';

import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { SingleLineEditor } from '../../single-line/src/SingleLineEditor';
import { SlugEditor } from '../src/SlugEditor';

const meta: Meta<typeof SlugEditor> = {
  title: 'editors/Slug',
  component: SlugEditor,
};

export default meta;

type Story = StoryObj<typeof SlugEditor>;

export const DefaultLocale: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI((field) => ({
      ...field,
      id: 'slug-id',
    }));
    const [titleField] = createFakeFieldAPI((field) => ({
      ...field,
      id: 'title-id',
    }));

    const sdk = {
      locales: createFakeLocalesAPI(),
      space: {
        getEntries: () => Promise.resolve({ total: 0 }),
      },
      entry: {
        getSys: () => {
          return {
            id: 'entry-id',
            publishedVersion: undefined,
            createdAt: '2020-01-24T15:33:47.906Z',
            contentType: {
              sys: {
                id: 'content-type-id',
              },
            },
          };
        },
        onSysChanged: () => {},
        fields: {
          'title-id': titleField,
          'entry-id': field,
        },
      },
      contentType: {
        displayField: 'title-id',
      },
    };
    return (
      <React.Fragment>
        <SingleLineEditor
          field={sdk.entry.fields['title-id']}
          locales={sdk.locales}
          isInitiallyDisabled={false}
        />
        <div style={{ marginTop: 20 }} />
        {/* @ts-expect-error */}
        <SlugEditor baseSdk={sdk} field={field} isInitiallyDisabled={false} />
        <ActionsPlayground mitt={mitt} />
      </React.Fragment>
    );
  },
};

export const NonDefaultLocale: Story = {
  render: () => {
    const [field] = createFakeFieldAPI((field) => ({
      ...field,
      id: 'slug-id',
    }));
    const [titleField] = createFakeFieldAPI((field) => ({
      ...field,
      id: 'title-id',
    }));

    const sdk = {
      locales: createFakeLocalesAPI(),
      space: {
        getEntries: () => Promise.resolve({ total: 0 }),
      },
      entry: {
        getSys: () => {
          return {
            id: 'entry-id',
            publishedVersion: undefined,
            createdAt: '2020-01-24T15:33:47.906Z',
            contentType: {
              sys: {
                id: 'content-type-id',
              },
            },
          };
        },
        onSysChanged: () => {},
        fields: {
          'title-id': titleField,
          'entry-id': field,
        },
      },
      contentType: {
        displayField: 'title-id',
      },
    };

    field.locale = 'ru-RU';
    field.required = false;
    sdk.locales.available = ['en-US', 'ru-RU'];
    sdk.locales.default = 'en-US';
    sdk.locales.optional = {
      'en-US': false,
      'ru-RU': false,
    };
    sdk.locales.fallbacks = {
      'en-US': undefined,
      'ru-RU': 'en-US',
    };

    return (
      <React.Fragment>
        <SingleLineEditor
          field={sdk.entry.fields['title-id']}
          locales={sdk.locales}
          isInitiallyDisabled={false}
        />
        <div style={{ marginTop: 20 }} />
        {/* @ts-expect-error */}
        <SlugEditor baseSdk={sdk} field={field} isInitiallyDisabled={false} />
      </React.Fragment>
    );
  },
};
