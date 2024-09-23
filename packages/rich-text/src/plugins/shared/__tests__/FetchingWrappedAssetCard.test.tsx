import * as React from 'react';

import { EntityProvider } from '@contentful/field-editor-reference';
import { createFakeCMAAdapter } from '@contentful/field-editor-test-utils';
import '@testing-library/jest-dom/extend-expect';
import { configure, fireEvent, render, waitFor } from '@testing-library/react';

import publishedAsset from '../__fixtures__/published_asset.json';
import { FetchingWrappedAssetCard } from '../FetchingWrappedAssetCard';

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
      Asset: { get: jest.fn().mockResolvedValue(publishedAsset) },
      ScheduledAction: {
        getMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      },
    }),
    space: {
      getEntityScheduledActions: jest.fn().mockResolvedValue([]),
    },
    navigator: {
      onSlideInNavigation: jest.fn(),
    },
    ids: {
      space: 'space-id',
      environment: 'environment-id',
    },
    parameters: {
      instance: {},
    },
    field: { localized: false },
  };
});

test('some dropdown actions should be disabled', async () => {
  const { getByTestId, queryByTestId } = render(
    <EntityProvider sdk={sdk}>
      <FetchingWrappedAssetCard
        sdk={sdk}
        assetId="asset-id"
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
  await waitFor(() => expect(getByTestId('cf-ui-asset').textContent).toBe('asset title'));

  fireEvent.click(getByTestId('cf-ui-card-actions'));

  await waitFor(() => {
    expect(getByTestId('card-action-edit')).not.toBeDisabled();
    expect(queryByTestId('card-action-remove')).toBeNull();
    expect(getByTestId('card-action-download')).not.toBeDisabled();
  });
});
