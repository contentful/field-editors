import { EntityLink, EntryLink, ResourceLink } from '@contentful/field-editor-reference';

const isResourceLink = (link: EntityLink | EntryLink | ResourceLink): link is ResourceLink =>
  !!(link as ResourceLink).sys.urn;

export const getLinkEntityId = (link: EntityLink | ResourceLink): string =>
  isResourceLink(link) ? link.sys.urn : link.sys.id;
