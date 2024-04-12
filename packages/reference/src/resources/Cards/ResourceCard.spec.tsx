import * as React from 'react';

import '@testing-library/jest-dom';

import { createFakeCMAAdapter } from '@contentful/field-editor-test-utils';
import { configure, fireEvent, render, waitFor } from '@testing-library/react';

import publishedCT from '../../__fixtures__/content-type/published_content_type.json';
import publishedEntryNonMasterEnvironment from '../../__fixtures__/entry/published_entry_non_master.json';
import publishedEntry from '../../__fixtures__/entry/published_entry.json';
import resourceType from '../../__fixtures__/resource-type/resource-type.json';
import resource from '../../__fixtures__/resource/resource.json';
import space from '../../__fixtures__/space/indifferent_space.json';
import { EntityProvider } from '../../common/EntityStore';
import { ResourceCard } from './ResourceCard';

configure({
  testIdAttribute: 'data-test-id',
});

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn().mockReturnValue({}),
}));

// explicit master
const resolvableEntryUrn = 'crn:contentful:::content:spaces/space-id/entries/linked-entry-urn';
const resolvableEntryUrnWithExplicitMaster =
  'crn:contentful:::content:spaces/space-id/environments/master/entries/linked-entry-urn';
const resolvableEntryUrnWithAnotherEnvironment =
  'crn:contentful:::content:spaces/space-id/environments/my-test-environment/entries/linked-entry-urn';
const unknownEntryUrn = 'crn:contentful:::content:spaces/space-id/entries/unknown-entry-urn';

const resolvableExternalResourceType = 'External:ResourceType';
const resolvableExternalEntityUrn = 'external:entity-urn';

const sdk: any = {
  locales: {
    default: 'en-US',
  },
  cmaAdapter: createFakeCMAAdapter({
    ContentType: { get: jest.fn().mockReturnValue(publishedCT) },
    Entry: {
      get: jest.fn().mockImplementation(({ spaceId, environmentId, entryId }) => {
        if (
          spaceId === 'space-id' &&
          environmentId === 'master' &&
          entryId === 'linked-entry-urn'
        ) {
          return Promise.resolve(publishedEntry);
        }
        if (
          spaceId === 'space-id' &&
          environmentId === 'my-test-environment' &&
          entryId === 'linked-entry-urn'
        ) {
          return Promise.resolve(publishedEntryNonMasterEnvironment);
        }
        return Promise.reject(new Error());
      }),
    },
    Http: {
      get: jest.fn().mockImplementation(({ url, config }) => {
        if (url === '/spaces/space-id/environments/environment-id/resource_types') {
          return Promise.resolve({ items: [resourceType] });
        }
        if (
          url ===
            `/spaces/space-id/environments/environment-id/resource_types/${resolvableExternalResourceType}/resources` &&
          config.params['sys.urn[in]'] === resolvableExternalEntityUrn
        ) {
          return Promise.resolve({ items: [resource] });
        }
        return Promise.resolve({ items: [] });
      }),
    },
    Locale: {
      getMany: jest.fn().mockResolvedValue({ items: [{ default: true, code: 'en' }] }),
    },
    ScheduledAction: {
      getMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    },
    Space: { get: jest.fn().mockResolvedValue(space) },
  }),
  space: { onEntityChanged: jest.fn() },
  navigator: {},
  ids: {
    space: 'space-id',
    environment: 'environment-id',
  },
};

function renderResourceCard({
  linkType = 'Contentful:Entry',
  entityUrn = resolvableEntryUrn,
} = {}) {
  return render(
    <EntityProvider sdk={sdk}>
      <ResourceCard
        isDisabled={false}
        getEntryRouteHref={() => ''}
        resourceLink={{
          sys: { type: 'ResourceLink', linkType: linkType as 'Contentful:Entry', urn: entityUrn },
        }}
      />
    </EntityProvider>
  );
}

describe('ResourceCard', () => {
  it('renders entry card with implicit master crn', async () => {
    const { getByTestId, getByText } = renderResourceCard();
    const tooltipContent = `Space: ${space.name} (Env.: ${publishedEntry.sys.environment.sys.id})`;

    await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
    expect(getByText(publishedEntry.fields.exField['en-US'])).toBeDefined();
    expect(getByText(space.name)).toBeDefined();
    fireEvent.mouseEnter(getByText(space.name));
    await waitFor(() => expect(getByText(tooltipContent)).toBeDefined());
  });

  it('renders entry card with explicit master crn', async () => {
    const { getByTestId, getByText } = renderResourceCard({
      entityUrn: resolvableEntryUrnWithExplicitMaster,
    });
    const tooltipContent = `Space: ${space.name} (Env.: ${publishedEntry.sys.environment.sys.id})`;

    await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
    expect(getByText(publishedEntry.fields.exField['en-US'])).toBeDefined();
    expect(getByText(space.name)).toBeDefined();
    fireEvent.mouseEnter(getByText(space.name));
    await waitFor(() => expect(getByText(tooltipContent)).toBeDefined());
  });

  it('renders entry card with a non master environment', async () => {
    const { getByTestId, getByText } = renderResourceCard({
      entityUrn: resolvableEntryUrnWithAnotherEnvironment,
    });

    await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
    const tooltipContent = `Space: ${space.name} (Env.: ${publishedEntryNonMasterEnvironment.sys.environment.sys.id})`;

    expect(getByText(publishedEntryNonMasterEnvironment.fields.exField['en-US'])).toBeDefined();
    expect(getByText(space.name)).toBeDefined();
    fireEvent.mouseEnter(getByText(space.name));
    await waitFor(() => expect(getByText(tooltipContent)).toBeDefined());
  });

  it('renders skeleton when no data is provided', () => {
    const { getByTestId } = renderResourceCard();

    expect(getByTestId('cf-ui-skeleton-form')).toBeDefined();
  });

  it('renders unsupported entity card when resource type is unknown', async () => {
    const { getByText } = renderResourceCard({ linkType: 'Contentful:UnsupportedLink' });

    await waitFor(() =>
      expect(
        getByText('Resource type Contentful:UnsupportedLink is currently not supported')
      ).toBeDefined()
    );
  });

  it('renders missing entity card when unknown error is returned', async () => {
    const { getByTestId } = renderResourceCard({ entityUrn: unknownEntryUrn });

    await waitFor(() => expect(getByTestId('cf-ui-missing-entry-card')).toBeDefined());
  });

  it('renders missing entity card when crn is invalid', async () => {
    const { getByTestId } = renderResourceCard({ entityUrn: '' });

    await waitFor(() => expect(getByTestId('cf-ui-missing-entry-card')).toBeDefined());
  });

  it('renders missing entity card when external urn is invalid', async () => {
    const { getByTestId } = renderResourceCard({
      linkType: resolvableExternalResourceType,
      entityUrn: '',
    });

    await waitFor(() => expect(getByTestId('cf-ui-missing-entry-card')).toBeDefined());
  });

  it('renders entry card for external resource', async () => {
    const { getByTestId, getByText } = renderResourceCard({
      linkType: resolvableExternalResourceType,
      entityUrn: resolvableExternalEntityUrn,
    });

    await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
    expect(getByText(resource.fields.title)).toBeDefined();
    expect(
      getByText(`${resourceType.sys.resourceProvider.sys.id} ${resourceType.name}`)
    ).toBeDefined();
  });
});
