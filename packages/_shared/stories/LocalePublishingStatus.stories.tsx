import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { EntryProps } from 'contentful-management';

import { LocalePublishStatus } from '../src/hooks/useLocalePublishStatus';
import * as LocalePublishingEntityStatusBadge from '../src/LocalePublishingEntityStatusBadge';

const meta: Meta<typeof LocalePublishingEntityStatusBadge.LocalePublishingPopover> = {
  title: 'shared/LocalePublishingEntityStatusBadge',
  component: LocalePublishingEntityStatusBadge.LocalePublishingPopover,
  argTypes: {
    isScheduled: {
      control: 'boolean',
      defaultValue: false,
    },
    jobs: {
      control: 'object',
      defaultValue: [],
    },
    entity: {
      control: 'object',
    },
    activeLocales: {
      control: 'object',
    },
    localesStatusMap: {
      control: 'object',
    },
  },
};

export default meta;

const defaultEntity: EntryProps = {
  sys: {
    space: {
      sys: { type: 'Link', linkType: 'Space', id: 'space-id' },
    },
    id: 'entry-id',
    type: 'Entry',
    createdAt: '2023-10-19T14:22:25.996Z',
    updatedAt: '2024-11-22T12:29:19.441Z',
    environment: {
      sys: { id: 'master', type: 'Link', linkType: 'Environment' },
    },
    firstPublishedAt: '2024-05-30T14:00:03.102Z',
    createdBy: {
      sys: { type: 'Link', linkType: 'User', id: 'user-id' },
    },
    updatedBy: {
      sys: { type: 'Link', linkType: 'User', id: 'user-id' },
    },
    publishedCounter: 4,
    version: 10,
    fieldStatus: {
      '*': {
        af: 'draft',
        ar: 'published',
        de: 'changed',
        'en-US': 'published',
        fr: 'changed',
      },
    },
    automationTags: [],
    contentType: {
      sys: { type: 'Link', linkType: 'ContentType', id: 'content-type-id' },
    },
  },
  fields: {
    title: {
      af: 'Lorem ipsum',
      ar: 'Lorem ipsum',
      de: 'Lorem ipsum',
      'en-US': 'Lorem ipsum',
      fr: 'Lorem ipsum',
    },
  },
};

type ComponentProps = React.ComponentProps<
  typeof LocalePublishingEntityStatusBadge.LocalePublishingPopover
>;

type StoryArgs = Omit<ComponentProps, 'localesStatusMap'> & {
  localesStatusMap: { [key: string]: LocalePublishStatus };
};

export const Default: StoryObj<StoryArgs> = {
  args: {
    entity: defaultEntity,
    isScheduled: false,
    jobs: [],
    activeLocales: [{ code: 'af' }, { code: 'ar' }, { code: 'de' }, { code: 'en-US' }],
    localesStatusMap: {
      af: { status: 'draft', locale: { code: 'af', default: false, name: 'Afrikaans' } },
      ar: { status: 'published', locale: { code: 'ar', default: false, name: 'Arabic' } },
      de: { status: 'changed', locale: { code: 'de', default: false, name: 'German' } },
      'en-US': {
        status: 'published',
        locale: { code: 'en-US', default: true, name: 'English (United States)' },
      },
      fr: { status: 'changed', locale: { code: 'fr', default: false, name: 'French' } },
    },
  },
  render: (args) => {
    const { localesStatusMap = {}, ...restArgs } = args;
    const localesStatusMapConverted: Map<string, LocalePublishStatus> = new Map(
      Object.entries(localesStatusMap)
    );

    return (
      <div>
        <LocalePublishingEntityStatusBadge.LocalePublishingPopover
          {...restArgs}
          localesStatusMap={localesStatusMapConverted}
        />
      </div>
    );
  },
};
