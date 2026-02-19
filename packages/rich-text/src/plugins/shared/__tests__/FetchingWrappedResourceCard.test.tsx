import * as React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { EntityProvider } from '@contentful/field-editor-reference';
import { SharedQueryClientProvider } from '@contentful/field-editor-shared/react-query';
import { createTestQueryClient } from '@contentful/field-editor-test-utils';
import { configure, render, waitFor } from '@testing-library/react';

import publishedCT from '../__fixtures__/published_content_type.json';
import publishedEntry from '../__fixtures__/published_entry.json';
import space from '../__fixtures__/space.json';
import { FetchingWrappedResourceCard } from '../FetchingWrappedResourceCard';

configure({
  testIdAttribute: 'data-test-id',
});

let sdk: any;

const resolvableEntryUrn = 'crn:contentful:::content:spaces/space-id/entries/linked-entry-urn';
const unknownEntryUrn = 'crn:contentful:::content:spaces/space-id/entries/unknown-entry-urn';

beforeEach(() => {
  sdk = {
    locales: {
      default: 'en-US',
      available: ['en-US'],
      names: {
        'en-US': 'English (United States)',
      },
    },
    cma: {
      contentType: { get: jest.fn().mockReturnValue(publishedCT) },
      entry: {
        get: jest.fn().mockImplementation(({ entryId }) => {
          if (entryId === 'linked-entry-urn') {
            return Promise.resolve(publishedEntry);
          }
          return Promise.reject(new Error());
        }),
      },
      locale: {
        getMany: jest.fn().mockResolvedValue({ items: [{ default: true, code: 'en' }] }),
      },
      scheduledAction: {
        getMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      },
      space: { get: jest.fn().mockResolvedValue(space) },
    },
    space: { onEntityChanged: jest.fn() },
    navigator: {},
    ids: {
      space: 'space-id',
      environment: 'environment-id',
    },
    parameters: { instance: {} },
    field: { localized: false },
  };
});

function renderResourceCard({ linkType = 'Contentful:Entry', entryUrn = resolvableEntryUrn } = {}) {
  return render(
    <EntityProvider sdk={sdk}>
      <FetchingWrappedResourceCard
        isDisabled={false}
        isSelected={false}
        sdk={sdk}
        link={{
          type: 'ResourceLink',
          linkType: linkType as 'Contentful:Entry',
          urn: entryUrn,
        }}
      />
    </EntityProvider>,
  );
}

test('renders entry card', async () => {
  const { getByTestId, getByText } = renderResourceCard();

  await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
  expect(getByText(publishedEntry.fields.exField.en)).toBeDefined();
  expect(getByText(space.name)).toBeDefined();
});

test('renders skeleton while data is loading', async () => {
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
        <FetchingWrappedResourceCard
          sdk={sdk}
          isDisabled={false}
          isSelected={false}
          link={{
            type: 'ResourceLink',
            linkType: 'Contentful:Entry',
            urn: resolvableEntryUrn,
          }}
        />
      </EntityProvider>
    </SharedQueryClientProvider>,
  );

  // Should show skeleton while loading
  expect(getByTestId('cf-ui-skeleton-form')).toBeDefined();
  expect(queryByTestId('cf-ui-entry-card')).toBeNull();

  // Resolve the promise
  resolveEntry!(publishedEntry);

  // Wait for entry card to appear
  await waitFor(() => expect(getByTestId('cf-ui-entry-card')).toBeDefined());
  expect(queryByTestId('cf-ui-skeleton-form')).toBeNull();
});

test('renders unsupported entity card when unsupported link is passed', async () => {
  const { getByText } = renderResourceCard({ linkType: 'Contentful:UnsupportedLink' });

  await waitFor(() => expect(getByText('Unsupported API information')).toBeDefined());
});

test('renders missing entity card when unknown error is returned', async () => {
  const { getByTestId } = renderResourceCard({ entryUrn: unknownEntryUrn });

  await waitFor(() => expect(getByTestId('cf-ui-missing-entity-card')).toBeDefined());
});
