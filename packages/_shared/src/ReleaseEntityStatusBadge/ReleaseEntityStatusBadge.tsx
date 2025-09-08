import React from 'react';

import { Badge, BadgeVariant } from '@contentful/f36-components';

import type { ReleaseAction } from '../types';

type ReleaseEntityActionBadgeProps = {
  action: ReleaseAction;
  className?: string;
};

const config: Record<ReleaseAction, { label: string; variant: BadgeVariant; schedule?: string }> = {
  publish: {
    label: 'Will publish',
    variant: 'positive' as const,
  },
  unpublish: {
    label: 'Becomes draft',
    variant: 'warning' as const,
  },
  'not-in-release': {
    label: 'Not in release',
    variant: 'secondary' as const,
  },
};

export function ReleaseEntityStatusBadge({ className, action }: ReleaseEntityActionBadgeProps) {
  const badgeConfig = config[action];

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
