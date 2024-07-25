import * as React from 'react';

import { EntityProvider } from '@contentful/field-editor-reference';
import { createFakeCMAAdapter } from '@contentful/field-editor-test-utils';
import '@testing-library/jest-dom/extend-expect';
import { configure, fireEvent, render, waitFor } from '@testing-library/react';

import publishedCT from '../__fixtures__/published_content_type.json';
import publishedEntry from '../__fixtures__/published_entry.json';
import { FetchingWrappedEntryCard } from '../FetchingWrappedEntryCard';

configure({
  testIdAttribute: 'data-test-id',
});

let sdk: any;

beforeEach(() => {
  sdk = {
    locales: {
      default: 'en-US',
    },
    cmaAdapter: createFakeCMAAdapter({
      Entry: { get: jest.fn().mockResolvedValue(publishedEntry) },
      ScheduledAction: {
        getMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      },
    }),
    space: {
      getEntityScheduledActions: jest.fn().mockResolvedValue([]),
      getCachedContentTypes: jest.fn().mockReturnValue([publishedCT]),
    },
    navigator: {
      onSlideInNavigation: jest.fn(),
    },
    ids: {
      space: 'space-id',
      environment: 'environment-id',
    },
    parameters: { instance: {} },
    field: { localized: false },
  };
});

test('some dropdown actions should be disabled/removed', async () => {
  const { getByTestId, queryByTestId } = render(
    <EntityProvider sdk={sdk}>
      <FetchingWrappedEntryCard
        sdk={sdk}
        entryId="entry-id"
        locale="en-US"
        // eslint-disable-next-line -- TODO: explain this disable
        onEdit={() => {}}
        // eslint-disable-next-line -- TODO: explain this disable
        onRemove={() => {}}
        isDisabled
        isSelected
      />
    </EntityProvider>
  );

  // Assert Asset title
  await waitFor(() => expect(getByTestId('title').textContent).toBe('The best article ever'));

  fireEvent.click(getByTestId('cf-ui-card-actions'));

  await waitFor(() => {
    expect(getByTestId('edit')).not.toBeDisabled();
    expect(queryByTestId('delete')).toBeNull();
  });
});
