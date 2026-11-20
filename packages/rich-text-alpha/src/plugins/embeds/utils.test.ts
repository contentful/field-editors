import type { FieldAppSDK } from '@contentful/app-sdk';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { describe, expect, it, vi } from 'vitest';

import { select } from './utils';

function createSdk() {
  const dialogs = {
    selectSingleEntry: vi
      .fn<FieldAppSDK['dialogs']['selectSingleEntry']>()
      .mockResolvedValue({ sys: { id: 'entry-id', type: 'Entry' } }),
    selectSingleAsset: vi
      .fn<FieldAppSDK['dialogs']['selectSingleAsset']>()
      .mockResolvedValue({ sys: { id: 'asset-id', type: 'Asset' } }),
    selectSingleResourceEntity: vi
      .fn<FieldAppSDK['dialogs']['selectSingleResourceEntity']>()
      .mockResolvedValue({
        sys: {
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
          urn: 'crn:contentful:::content:spaces/space-id/entries/entry-id',
        },
      }),
  };
  const sdk = { field: { locale: 'en-US', validations: [] }, dialogs } as unknown as FieldAppSDK;
  return { sdk, dialogs };
}

describe('embedded entity selection', () => {
  it.each([INLINES.EMBEDDED_ENTRY, BLOCKS.EMBEDDED_ENTRY] as const)(
    'turns the entry selected for %s into a link',
    async (nodeType) => {
      const { sdk, dialogs } = createSdk();
      await expect(select({ sdk, nodeType })).resolves.toEqual({
        sys: { type: 'Link', linkType: 'Entry', id: 'entry-id' },
      });
      expect(dialogs.selectSingleEntry).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'en-US', withCreate: true }),
      );
    },
  );

  it('turns the selected asset into a link', async () => {
    const { sdk } = createSdk();
    await expect(select({ sdk, nodeType: BLOCKS.EMBEDDED_ASSET })).resolves.toEqual({
      sys: { type: 'Link', linkType: 'Asset', id: 'asset-id' },
    });
  });

  it.each([INLINES.EMBEDDED_RESOURCE, BLOCKS.EMBEDDED_RESOURCE] as const)(
    'keeps the resource entry selected for %s',
    async (nodeType) => {
      const { sdk } = createSdk();
      await expect(select({ sdk, nodeType })).resolves.toEqual({
        sys: {
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
          urn: 'crn:contentful:::content:spaces/space-id/entries/entry-id',
        },
      });
    },
  );

  it('does not embed a resource type that rich text does not support', async () => {
    const { sdk, dialogs } = createSdk();
    dialogs.selectSingleResourceEntity.mockResolvedValue({
      sys: { type: 'ResourceLink', linkType: 'Contentful:Asset', urn: 'asset-urn' },
    });
    await expect(select({ sdk, nodeType: INLINES.EMBEDDED_RESOURCE })).resolves.toBeNull();
  });

  it('returns no link when selection is cancelled', async () => {
    const { sdk, dialogs } = createSdk();
    dialogs.selectSingleEntry.mockResolvedValue(null);
    dialogs.selectSingleAsset.mockResolvedValue(null);
    dialogs.selectSingleResourceEntity.mockResolvedValue(null);
    await expect(select({ sdk, nodeType: INLINES.EMBEDDED_ENTRY })).resolves.toBeNull();
    await expect(select({ sdk, nodeType: BLOCKS.EMBEDDED_ASSET })).resolves.toBeNull();
    await expect(select({ sdk, nodeType: INLINES.EMBEDDED_RESOURCE })).resolves.toBeNull();
  });
});
