import type { FieldAppSDK } from '@contentful/app-sdk';
import { INLINES, Link, ResourceHyperlink, BLOCKS } from '@contentful/rich-text-types';

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
}: SelectOptions): Promise<Link | ResourceHyperlink | null> {
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
      ? dialogs.selectSingleEntry
      : nodeType === BLOCKS.EMBEDDED_ASSET
        ? dialogs.selectSingleAsset
        : // @ts-expect-error wait for update of app-sdk version
          dialogs.selectSingleResourceEntity;

  const entityOrLink = await open(dialogOptions);
  if (!entityOrLink) {
    return null;
  }

  if (
    nodeType === INLINES.EMBEDDED_ENTRY ||
    nodeType === BLOCKS.EMBEDDED_ENTRY ||
    nodeType === BLOCKS.EMBEDDED_ASSET
  ) {
    return {
      sys: {
        id: entityOrLink.sys.id,
        type: 'Link',
        linkType: entityOrLink.sys.type,
      },
    } as Link;
  }

  return entityOrLink as ResourceHyperlink;
}
