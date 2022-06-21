import React from 'react';

import { EntityProvider } from '@contentful/field-editor-reference';
import { render, configure, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

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
    space: {
      getAsset: jest.fn().mockResolvedValue(publishedAsset),
      getEntityScheduledActions: jest.fn().mockResolvedValue([]),
    },
    navigator: {
      onSlideInNavigation: jest.fn(),
    },
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
  await waitFor(() => expect(getByTestId('cf-ui-asset').textContent).toEqual('asset title'));

  fireEvent.click(getByTestId('cf-ui-card-actions'));

  await waitFor(() => {
    expect(getByTestId('card-action-edit')).not.toBeDisabled();
    expect(queryByTestId('card-action-remove')).toBeNull();
    expect(getByTestId('card-action-download')).not.toBeDisabled();
  });
});
