import type { Asset, Entry, FieldAppSDK } from '@contentful/app-sdk';
import { INLINES, Link, ResourceLink, BLOCKS } from '@contentful/rich-text-types';

import {
  getAllowedResourcesForNodeType,
  getLinkedContentTypeIdsForNodeType,
} from '../../core/validation';

export interface SelectOptions {
  sdk: FieldAppSDK;
  nodeType:
    | INLINES.EMBEDDED_ENTRY
    | INLINES.EMBEDDED_RESOURCE
    | BLOCKS.EMBEDDED_ENTRY
    | BLOCKS.EMBEDDED_ASSET
    | BLOCKS.EMBEDDED_RESOURCE;
}

export async function select({
  sdk,
  nodeType,
}: SelectOptions): Promise<Link | ResourceLink | null> {
  const { field, dialogs } = sdk;

  const dialogOptions: Record<string, unknown> = {
    locale: field.locale,
    withCreate: true,
  };

  switch (nodeType) {
    case INLINES.EMBEDDED_ENTRY:
      dialogOptions.contentTypes = getLinkedContentTypeIdsForNodeType(field, nodeType);
      break;
    case INLINES.EMBEDDED_RESOURCE:
      dialogOptions.allowedResources = getAllowedResourcesForNodeType(field, nodeType);
      break;
  }

  if (nodeType === INLINES.EMBEDDED_ENTRY || nodeType === BLOCKS.EMBEDDED_ENTRY) {
    const entry = await dialogs.selectSingleEntry<Entry>(dialogOptions);
    if (!entry) return null;
    return {
      sys: {
        id: entry.sys.id,
        type: 'Link',
        linkType: 'Entry',
      },
    };
  }

  if (nodeType === BLOCKS.EMBEDDED_ASSET) {
    const asset = await dialogs.selectSingleAsset<Asset>(dialogOptions);
    if (!asset) return null;
    return {
      sys: {
        id: asset.sys.id,
        type: 'Link',
        linkType: 'Asset',
      },
    };
  }

  const resource = await dialogs.selectSingleResourceEntity(dialogOptions);
  if (resource?.sys.linkType !== 'Contentful:Entry') return null;
  return {
    sys: {
      ...resource.sys,
      linkType: 'Contentful:Entry',
    },
  };
}
