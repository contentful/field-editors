import React from 'react';

import { Badge } from '@contentful/f36-components';

import type { ReleaseEntityStatus } from '../types';
import { getReleaseStatusBadgeConfig } from '../utils/getReleaseStatusBadgeConfig';

type ReleaseEntityActionBadgeProps = {
  status: ReleaseEntityStatus;
  className?: string;
};

export function ReleaseEntityStatusBadge({ className, status }: ReleaseEntityActionBadgeProps) {
  const { label, variant } = getReleaseStatusBadgeConfig(status);

  return (
    <Badge testId="release-entity-action-status" className={className} variant={variant}>
      {label}
    </Badge>
  );
}
