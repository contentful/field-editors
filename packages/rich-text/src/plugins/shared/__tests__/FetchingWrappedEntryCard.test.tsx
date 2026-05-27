import * as React from 'react';

import { EntityProvider } from '@contentful/field-editor-reference';
import { configure, fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

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
      available: ['en-US'],
      names: {
        'en-US': 'English (United States)',
      },
    },
    cma: {
      entry: { get: vi.fn().mockResolvedValue(publishedEntry) },
      scheduledAction: {
        getMany: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      },
      contentType: {
        get: vi.fn().mockResolvedValue(publishedCT),
      },
    },
    space: {
      getEntityScheduledActions: vi.fn().mockResolvedValue([]),
    },
    navigator: {
      onSlideInNavigation: vi.fn(),
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
    </EntityProvider>,
  );

  // Assert Asset title
  await waitFor(() => expect(getByTestId('title').textContent).toBe('The best article ever'));

  fireEvent.click(getByTestId('cf-ui-card-actions'));

  await waitFor(() => {
    expect(getByTestId('edit')).not.toBeDisabled();
    expect(queryByTestId('delete')).toBeNull();
  });
});
