import React from 'react';

import { SpaceAPI } from '@contentful/app-sdk';
import { act, configure, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import publishedAsset from '../__fixtures__/asset/published_asset.json';
import publishedEntry from '../__fixtures__/entry/published_entry.json';
import { WrappedAssetCard } from '../assets/WrappedAssetCard/WrappedAssetCard';
import { WrappedAssetLink } from '../assets/WrappedAssetCard/WrappedAssetLink';
import { WrappedEntryCard } from '../entries/WrappedEntryCard/WrappedEntryCard';
import { Asset, Entry } from '../types';

configure({ testIdAttribute: 'data-test-id' });

const sharedProps = {
  isDisabled: false,
  localeCode: 'en-US',
  defaultLocaleCode: 'en-US'
};

const cards = [
  {
    name: 'entry',
    loadedEntity: publishedEntry,
    missingTestId: 'cf-ui-missing-entity-card',
    renderEntity: (
      entity: unknown,
      getEntityScheduledActions: SpaceAPI['getEntityScheduledActions']
    ) => (
      <WrappedEntryCard
        {...sharedProps}
        entry={entity as Entry}
        size="small"
        hasCardEditActions={false}
        getAsset={vi.fn().mockResolvedValue(undefined)}
        getEntityScheduledActions={getEntityScheduledActions}
      />
    )
  },
  {
    name: 'asset card',
    loadedEntity: publishedAsset,
    missingTestId: 'cf-ui-missing-asset-card',
    renderEntity: (
      entity: unknown,
      getEntityScheduledActions: SpaceAPI['getEntityScheduledActions']
    ) => (
      <WrappedAssetCard
        {...sharedProps}
        asset={entity as Asset}
        size="small"
        getEntityScheduledActions={getEntityScheduledActions}
      />
    )
  },
  {
    name: 'asset link',
    loadedEntity: publishedAsset,
    missingTestId: 'cf-ui-missing-asset-card',
    renderEntity: (
      entity: unknown,
      getEntityScheduledActions: SpaceAPI['getEntityScheduledActions']
    ) => (
      <WrappedAssetLink
        {...sharedProps}
        asset={entity as Asset}
        getEntityScheduledActions={getEntityScheduledActions}
      />
    )
  }
];

describe.each(cards)('$name status', ({ renderEntity, missingTestId, loadedEntity }) => {
  test.each([undefined, null, {}, { sys: undefined }, { sys: {} }])(
    'shows a missing card instead of inferring a status for %j',
    (entity) => {
      const getEntityScheduledActions = vi
        .fn<SpaceAPI['getEntityScheduledActions']>()
        .mockResolvedValue([]);

      render(renderEntity(entity, getEntityScheduledActions));

      expect(screen.getByTestId(missingTestId)).toBeInTheDocument();
      expect(screen.queryByTestId('cf-ui-badge')).not.toBeInTheDocument();
      expect(getEntityScheduledActions).not.toHaveBeenCalled();
    }
  );

  test('handles missing-to-loaded-to-missing transitions', async () => {
    const getEntityScheduledActions = vi
      .fn<SpaceAPI['getEntityScheduledActions']>()
      .mockResolvedValue([]);
    const { rerender } = render(renderEntity(undefined, getEntityScheduledActions));

    await act(async () => {
      rerender(renderEntity(loadedEntity, getEntityScheduledActions));
    });

    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.queryByTestId(missingTestId)).not.toBeInTheDocument();

    rerender(renderEntity(undefined, getEntityScheduledActions));

    expect(screen.getByTestId(missingTestId)).toBeInTheDocument();
    expect(screen.queryByTestId('cf-ui-badge')).not.toBeInTheDocument();
  });
});
