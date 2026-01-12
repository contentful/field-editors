import { INLINES, type Link, type ResourceLink } from '@contentful/rich-text-types';

export interface Hyperlink {
  uri: string | null;
  target: Link<'Entry' | 'Asset'> | ResourceLink | null;
}

export const LINK_TYPES = [
  INLINES.HYPERLINK,
  INLINES.ENTRY_HYPERLINK,
  INLINES.RESOURCE_HYPERLINK,
  INLINES.ASSET_HYPERLINK,
] as const;

export const DEFAULT_LINK_TYPE = INLINES.HYPERLINK;

export type LinkType = (typeof LINK_TYPES)[number];

export const getLinkType = (link: Hyperlink): LinkType => {
  if (!link.target) {
    return INLINES.HYPERLINK;
  }

  if (link.target.sys.linkType === 'Entry') {
    return INLINES.ENTRY_HYPERLINK;
  }

  if (link.target.sys.linkType === 'Asset') {
    return INLINES.ASSET_HYPERLINK;
  }

  return INLINES.RESOURCE_HYPERLINK;
};
