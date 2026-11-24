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

  const open =
    nodeType === INLINES.EMBEDDED_ENTRY || nodeType === BLOCKS.EMBEDDED_ENTRY
      ? dialogs.selectSingleEntry<Entry>
      : nodeType === BLOCKS.EMBEDDED_ASSET
        ? dialogs.selectSingleAsset<Asset>
        : dialogs.selectSingleResourceEntity;

  const entityOrLink = await open(dialogOptions);
  if (!entityOrLink) {
    return null;
  }

  if (
    nodeType === INLINES.EMBEDDED_ENTRY ||
    nodeType === BLOCKS.EMBEDDED_ENTRY ||
    nodeType === BLOCKS.EMBEDDED_ASSET
  ) {
    const entity = entityOrLink as Entry | Asset;
    return {
      sys: {
        id: entity.sys.id,
        type: 'Link',
        linkType: entity.sys.type,
      },
    } as Link;
  }

  return entityOrLink as ResourceLink;
}
