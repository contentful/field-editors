import { useResource } from '@contentful/field-editor-reference';
import { ResourceLink } from '@contentful/rich-text-types';

import { truncateTitle } from './utils';

export function useResourceEntityInfo(target: ResourceLink) {
  const { data, error } = useResource(target.sys.linkType, target.sys.urn);

  if (!data) {
    return `Loading entry...`;
  }

  if (error) {
    return `Entry missing or inaccessible`;
  }

  const title =
    truncateTitle(
      data.resource.fields[data.contentType.displayField]?.[data.defaultLocaleCode],
      60
    ) || 'Untitled';

  return `${data.contentType.name}: ${title} (Space: ${data.space.name} – Env.: ${data.resource.sys.environment.sys.id})`;
}
