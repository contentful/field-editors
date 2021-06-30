import * as React from 'react';
import { Tag } from '@contentful/forma-36-react-components';

interface EntityStatusTagProps {
  statusLabel: string;
}

export function EntityStatusTag({ statusLabel }: EntityStatusTagProps) {
  const tagTypeMap = {
    published: 'positive',
    draft: 'warning',
    archived: 'negative',
    changed: 'primary',
  };

  return <Tag tagType={tagTypeMap[statusLabel]}>{statusLabel}</Tag>;
}
