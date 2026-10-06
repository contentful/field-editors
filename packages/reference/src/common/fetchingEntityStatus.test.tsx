import React from 'react';

import { configure, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { FetchingWrappedAssetCard } from '../assets/WrappedAssetCard/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../entries/WrappedEntryCard/FetchingWrappedEntryCard';
import { Entry, FieldAppSDK } from '../types';
import { useEntity, useEntityLoader } from './EntityStore';

vi.mock('./EntityStore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./EntityStore')>()),
  useEntity: vi.fn(),
  useEntityLoader: vi.fn()
}));

configure({ testIdAttribute: 'data-test-id' });

const sdk = {
  locales: { available: ['en-US'], default: 'en-US', names: { 'en-US': 'English' } },
  field: { locale: 'en-US' },
  parameters: { instance: {} }
} as unknown as FieldAppSDK;

const props = {
  sdk,
  viewType: 'link' as const,
  isDisabled: false,
  onRemove: vi.fn()
};

const cards = [
  {
    name: 'entry',
    missingTestId: 'cf-ui-missing-entity-card',
    renderCard: () => (
      <FetchingWrappedEntryCard
        {...props}
        entryId="linked-id"
        allContentTypes={[]}
        isInitiallyDisabled={false}
        hasCardEditActions={false}
        parameters={{ instance: {} }}
      />
    )
  },
  {
    name: 'asset',
    missingTestId: 'cf-ui-missing-asset-card',
    renderCard: () => <FetchingWrappedAssetCard {...props} assetId="linked-id" />
  }
];

beforeEach(() => {
  vi.mocked(useEntityLoader).mockReturnValue({
    getEntity: vi.fn().mockResolvedValue(undefined),
    getEntityScheduledActions: vi.fn().mockResolvedValue([])
  } as unknown as ReturnType<typeof useEntityLoader>);
});

describe.each(cards)('fetching $name status', ({ renderCard, missingTestId }) => {
  test.each([undefined, null, {}, { sys: undefined }, { sys: {} }])(
    'handles a completed fetch with missing metadata (%j)',
    (entity) => {
      vi.mocked(useEntity).mockReturnValue({
        status: 'success',
        data: entity as unknown as Entry,
        currentEntity: undefined
      });

      render(renderCard());

      expect(screen.getByTestId(missingTestId)).toBeInTheDocument();
      expect(screen.queryByTestId('cf-ui-badge')).not.toBeInTheDocument();
    }
  );

  test('preserves the loading card while the entity is being fetched', () => {
    vi.mocked(useEntity).mockReturnValue({ status: 'loading' } as ReturnType<typeof useEntity>);

    render(renderCard());

    expect(screen.getByTestId('cf-ui-skeleton-form')).toBeInTheDocument();
    expect(screen.queryByTestId(missingTestId)).not.toBeInTheDocument();
  });
});
