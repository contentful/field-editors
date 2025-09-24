import React from 'react';

import { Badge, BadgeVariant } from '@contentful/f36-components';

import type { ReleaseEntityStatus } from '../types';

type ReleaseEntityActionBadgeProps = {
  status: ReleaseEntityStatus;
  className?: string;
};

const config: Record<ReleaseEntityStatus, { label: string; variant: BadgeVariant }> = {
  willPublish: {
    label: 'Will publish',
    variant: 'positive' as const,
  },
  becomesDraft: {
    label: 'Becomes draft',
    variant: 'warning' as const,
  },
  remainsDraft: {
    label: 'Remains draft',
    variant: 'warning' as const,
  },
  notInRelease: {
    label: 'Not in release',
    variant: 'secondary' as const,
  },
  published: {
    label: 'Published',
    variant: 'positive' as const,
  },
};

export function ReleaseEntityStatusBadge({ className, status }: ReleaseEntityActionBadgeProps) {
  const badgeConfig = config[status];

  return (
    <Badge
      testId="release-entity-action-status"
      className={className}
      variant={badgeConfig.variant}
    >
      {badgeConfig.label}
    </Badge>
  );
}
