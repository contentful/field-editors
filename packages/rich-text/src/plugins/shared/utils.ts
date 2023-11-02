import { EntityLink, EntryLink, ResourceLink } from '@contentful/field-editor-reference';

const isResourceLink = (link: EntityLink | EntryLink | ResourceLink): link is ResourceLink =>
  !!(link as ResourceLink).sys.urn;

export const getLinkEntityId = (link: EntityLink | ResourceLink): string =>
  isResourceLink(link) ? link.sys.urn : link.sys.id;

export function truncateTitle(str: string, length: number) {
  if (typeof str === 'string' && str.length > length) {
    return (
      str &&
      str
        .substr(0, length + 1) // +1 to look ahead and be replaced below.
        // Get rid of orphan letters but not one letter words (I, a, 2).
        // Try to not have “.” as last character to avoid awkward “....”.
        .replace(/(\s+\S(?=\S)|\s*)\.?.$/, '…')
    );
  }

  return str;
}
