import React from 'react';

import { EntityProvider } from '@contentful/field-editor-reference';
import { render, configure, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

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
    space: {
      getEntry: jest.fn().mockResolvedValue(publishedEntry),
      getEntityScheduledActions: jest.fn().mockResolvedValue([]),
      getCachedContentTypes: jest.fn().mockReturnValue([publishedCT]),
    },
    navigator: {
      onSlideInNavigation: jest.fn(),
    },
  };
});

test('dropdown actions should be disabled', async () => {
  const { getByTestId } = render(
    <EntityProvider sdk={sdk}>
      <FetchingWrappedEntryCard
        sdk={sdk}
        entryId="entry-id"
        locale="en-US"
        // eslint-disable-next-line
        onEdit={() => {}}
        // eslint-disable-next-line
        onRemove={() => {}}
        isDisabled
        isSelected
      />
    </EntityProvider>
  );

  // Assert Asset title
  await waitFor(() => expect(getByTestId('title').textContent).toEqual('The best article ever'));

  fireEvent.click(getByTestId('cf-ui-card-actions'));

  await waitFor(() => {
    expect(getByTestId('card-action-edit')).toBeDisabled();
    expect(getByTestId('card-action-remove')).toBeDisabled();
  });
});
