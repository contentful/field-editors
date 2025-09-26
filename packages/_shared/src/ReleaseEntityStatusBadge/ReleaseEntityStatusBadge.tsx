import React from 'react';

import { Badge, BadgeVariant } from '@contentful/f36-components';
import { t } from '@lingui/core/macro';

import type { ReleaseEntityStatus } from '../types';

type ReleaseEntityActionBadgeProps = {
  status: ReleaseEntityStatus;
  className?: string;
};

function getConfig(status: ReleaseEntityStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case 'willPublish':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.WillPublish',
          message: 'Will publish',
        }),
        variant: 'positive' as const,
      };
    case 'becomesDraft':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.BecomesDraft',
          message: 'Becomes draft',
        }),
        variant: 'warning' as const,
      };
    case 'remainsDraft':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.RemainsDraft',
          message: 'Remains draft',
        }),
        variant: 'warning' as const,
      };
    case 'notInRelease':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.NotInRelease',
          message: 'Not in release',
        }),
        variant: 'secondary' as const,
      };
    case 'published':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.Published',
          message: 'Published',
        }),
        variant: 'positive' as const,
      };
  }
}

export function ReleaseEntityStatusBadge({ className, status }: ReleaseEntityActionBadgeProps) {
  const { label, variant } = getConfig(status);

  return (
    <Badge testId="release-entity-action-status" className={className} variant={variant}>
      {label}
    </Badge>
  );
}
