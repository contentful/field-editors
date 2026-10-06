import React from 'react';

import { configure, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { FetchingWrappedAssetCard } from '../assets/WrappedAssetCard/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../entries/WrappedEntryCard/FetchingWrappedEntryCard';
import { FieldAppSDK } from '../types';
import { EntityProvider } from './EntityStore';

configure({ testIdAttribute: 'data-test-id' });

function createSdk(entity: unknown) {
  return {
    locales: { available: ['en-US'], default: 'en-US', names: { 'en-US': 'English' } },
    field: { locale: 'en-US' },
    parameters: { instance: {} },
    ids: { space: 'space-id', environment: 'environment-id' },
    cma: {
      entry: { get: vi.fn().mockResolvedValue(entity) },
      asset: { get: vi.fn().mockResolvedValue(entity) },
    },
    space: {
      onEntityChanged: vi.fn(() => () => {}),
      getEntityScheduledActions: vi.fn().mockResolvedValue([]),
    },
    navigator: { onSlideInNavigation: vi.fn() },
  } as unknown as FieldAppSDK;
}

const props = { viewType: 'link' as const, isDisabled: false, onRemove: vi.fn() };

const cards = [
  {
    name: 'entry',
    missingTestId: 'cf-ui-missing-entity-card',
    renderCard: (sdk: FieldAppSDK) => (
      <FetchingWrappedEntryCard
        {...props}
        sdk={sdk}
        entryId="linked-id"
        allContentTypes={[]}
        isInitiallyDisabled={false}
        hasCardEditActions={false}
        parameters={{ instance: {} }}
      />
    ),
  },
  {
    name: 'asset',
    missingTestId: 'cf-ui-missing-asset-card',
    renderCard: (sdk: FieldAppSDK) => (
      <FetchingWrappedAssetCard {...props} sdk={sdk} assetId="linked-id" />
    ),
  },
];

describe.each(cards)('fetching $name status', ({ name, renderCard, missingTestId }) => {
  test.each([{}, { sys: {} }, ...(name === 'entry' ? [{ sys: { id: 'linked-id' } }] : [])])(
    'shows a missing card when the CMA returns malformed metadata (%j)',
    async (entity) => {
      const sdk = createSdk(entity);

      render(<EntityProvider sdk={sdk}>{renderCard(sdk)}</EntityProvider>);

      expect(await screen.findByTestId(missingTestId)).toBeInTheDocument();
      expect(screen.queryByTestId('cf-ui-badge')).not.toBeInTheDocument();
    },
  );

  test('preserves the loading card while the entity is being fetched', () => {
    const sdk = createSdk(undefined);
    vi.mocked(sdk.cma.entry.get).mockReturnValue(new Promise(() => {}));
    vi.mocked(sdk.cma.asset.get).mockReturnValue(new Promise(() => {}));

    render(<EntityProvider sdk={sdk}>{renderCard(sdk)}</EntityProvider>);

    expect(screen.getByTestId('cf-ui-skeleton-form')).toBeInTheDocument();
    expect(screen.queryByTestId(missingTestId)).not.toBeInTheDocument();
  });
});
