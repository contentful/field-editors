import React from 'react';
import { render, configure, waitFor, fireEvent } from '@testing-library/react';
import { EntityProvider } from '@contentful/field-editor-reference';
import '@testing-library/jest-dom/extend-expect';

import { FetchingWrappedAssetCard } from '../FetchingWrappedAssetCard';
import publishedAsset from '../__fixtures__/published_asset.json';

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

test('dropdown actions should be disabled', async () => {
  const { getByTestId } = render(
    <EntityProvider sdk={sdk}>
      <FetchingWrappedAssetCard
        sdk={sdk}
        assetId="asset-id"
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
  await waitFor(() => expect(getByTestId('cf-ui-asset').textContent).toEqual('asset title'));

  fireEvent.click(getByTestId('cf-ui-card-actions'));

  await waitFor(() => {
    expect(getByTestId('card-action-edit')).toBeDisabled();
    expect(getByTestId('card-action-remove')).toBeDisabled();
    expect(getByTestId('card-action-download')).not.toBeDisabled();
  });
});
