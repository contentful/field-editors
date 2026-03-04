import * as React from 'react';

import '@testing-library/jest-dom';

import { SharedQueryClientProvider } from '@contentful/field-editor-shared/react-query';
import { createTestQueryClient } from '@contentful/field-editor-test-utils';
import { configure, fireEvent, render, waitFor } from '@testing-library/react';

import publishedCT from '../../__fixtures__/content-type/published_content_type.json';
import publishedEntryNonMasterEnvironment from '../../__fixtures__/entry/published_entry_non_master.json';
import publishedEntry from '../../__fixtures__/entry/published_entry.json';
import resourceType from '../../__fixtures__/resource-type/resource-type.json';
import resource from '../../__fixtures__/resource/resource.json';
import space from '../../__fixtures__/space/indifferent_space.json';
import { EntityProvider, FunctionInvocationErrorResponse } from '../../common/EntityStore';
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
const unresolvableExternalEntityUrn = 'external:unresolvable-entity-urn';

const sdk: any = {
  locales: {
    default: 'en-US',
  },
  cma: {
    contentType: {
      get: jest.fn().mockReturnValue(publishedCT),
    },
    entry: {
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
    locale: {
      getMany: jest.fn().mockResolvedValue({ items: [{ default: true, code: 'en' }] }),
    },
    resource: {
      getMany: jest.fn().mockImplementation(({ spaceId, environmentId, resourceTypeId, query }) => {
        if (
          spaceId === 'space-id' &&
          environmentId === 'environment-id' &&
          resourceTypeId === resolvableExternalResourceType &&
          query['sys.urn[in]'] === resolvableExternalEntityUrn
        ) {
          return Promise.resolve({ items: [resource] });
        }

        if (query['sys.urn[in]'] === unresolvableExternalEntityUrn) {
          const badRequestErrorBody: { message: FunctionInvocationErrorResponse['message'] } = {
            message: 'An error occurred while executing the Contentful Function code',
          };

          return Promise.reject(new Error(JSON.stringify(badRequestErrorBody)));
        }

        return Promise.resolve({ items: [] });
      }),
    },
    resourceType: {
      getForEnvironment: jest.fn().mockImplementation(({ spaceId, environmentId }) => {
        console.log('>> getForEnvironment', { spaceId, environmentId });
        if (spaceId === 'space-id' && environmentId === 'environment-id') {
          return Promise.resolve({ items: [resourceType], pages: {} });
        }
        return Promise.resolve({ items: [] });
      }),
    },
    scheduledActions: {
      getMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    },
    space: { get: jest.fn().mockResolvedValue(space) },
    resourceProvider: {
      get: jest.fn().mockImplementation(() => {
        return Promise.resolve({ function: { sys: { id: 'function-id' } } });
      }),
    },
  },
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
    </EntityProvider>,
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

  it('renders skeleton while data is loading', async () => {
    // Create a fresh QueryClient to avoid cached data
    const queryClient = createTestQueryClient();

    let resolveEntry: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveEntry = resolve;
    });

    sdk.cma.entry.get.mockReturnValueOnce(pendingPromise);

    const { getByTestId, queryByTestId } = render(
      <SharedQueryClientProvider client={queryClient}>
        <EntityProvider sdk={sdk}>
          <ResourceCard
            isDisabled={false}
            getEntryRouteHref={() => ''}
            resourceLink={{
              sys: {
                type: 'ResourceLink',
                linkType: 'Contentful:Entry',
                urn: resolvableEntryUrn,
              },
            }}
          />
        </EntityProvider>
      </SharedQueryClientProvider>,
    );

    // Should show skeleton while loading
    expect(getByTestId('cf-ui-skeleton-form')).toBeDefined();
    expect(queryByTestId('cf-ui-entry-card')).toBeNull();

    resolveEntry!(publishedEntry);

    // Wait for entry card to appear
    await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
    expect(queryByTestId('cf-ui-skeleton-form')).toBeNull();
  });

  it('renders unsupported entity card when resource type is unknown', async () => {
    const { getByText } = renderResourceCard({ linkType: 'Contentful:UnsupportedLink' });

    await waitFor(() => expect(getByText('Unsupported API information')).toBeDefined());
  });

  it('renders missing entity card when unknown error is returned', async () => {
    const { getByTestId } = renderResourceCard({ entityUrn: unknownEntryUrn });

    await waitFor(() => expect(getByTestId('cf-ui-missing-entity-card')).toBeDefined());
  });

  it('renders missing entity card when crn is invalid', async () => {
    const { getByTestId, getByText } = renderResourceCard({ entityUrn: '' });

    await waitFor(() => expect(getByTestId('cf-ui-missing-entity-card')).toBeDefined());
    await waitFor(() => expect(getByText('Content missing or inaccessible')).toBeDefined());
  });

  it('renders missing entity card when external urn is invalid', async () => {
    const { getByTestId, getByText } = renderResourceCard({
      linkType: resolvableExternalResourceType,
      entityUrn: '',
    });

    await waitFor(() => expect(getByTestId('cf-ui-missing-entity-card')).toBeDefined());
    await waitFor(() => expect(getByText('Content missing or inaccessible')).toBeDefined());
  });

  it('renders entry card for external resource', async () => {
    const { getByTestId, getByText } = renderResourceCard({
      linkType: resolvableExternalResourceType,
      entityUrn: resolvableExternalEntityUrn,
    });

    await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
    expect(getByText(resource.fields.title)).toBeDefined();
    expect(
      getByText(`${resourceType.sys.resourceProvider.sys.id} ${resourceType.name}`),
    ).toBeDefined();
  });

  it('renders function invocation error card when an external resource request fails', async () => {
    const { getByTestId } = renderResourceCard({
      linkType: resolvableExternalResourceType,
      entityUrn: unresolvableExternalEntityUrn,
    });

    await waitFor(() => expect(getByTestId('cf-ui-function-invocation-error-card')).toBeDefined());
    await waitFor(() => expect(getByTestId('cf-ui-function-invocation-log-link')).toBeDefined());
  });
});
