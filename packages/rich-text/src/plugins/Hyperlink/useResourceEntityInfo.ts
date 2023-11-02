import * as React from 'react';

import { useResource } from '@contentful/field-editor-reference';
import { ResourceLink } from '@contentful/rich-text-types';

import { truncateTitle } from '../../plugins/shared/utils';

type ResourceEntityInfoProps = {
  target: ResourceLink;
  onEntityFetchComplete?: VoidFunction;
};

export function useResourceEntityInfo({ onEntityFetchComplete, target }: ResourceEntityInfoProps) {
  const { data, error, status } = useResource(target.sys.linkType, target.sys.urn);

  React.useEffect(() => {
    if (status === 'success') {
      onEntityFetchComplete?.();
    }
  }, [status, onEntityFetchComplete]);

  if (status === 'loading') {
    return `Loading entry...`;
  }

  if (!data || error) {
    return `Entry missing or inaccessible`;
  }

  const title =
    truncateTitle(
      data.resource.fields[data.contentType.displayField]?.[data.defaultLocaleCode],
      40
    ) || 'Untitled';

  return `${data.contentType.name}: ${title} (Space: ${data.space.name} – Env.: ${data.resource.sys.environment.sys.id})`;
}
