import { BadgeVariant } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { t } from '@lingui/core/macro';
import { ReleaseEntityStatus } from 'types';

export function getReleaseStatusBadgeConfig(status: ReleaseEntityStatus): {
  label: string;
  variant: BadgeVariant;
  default: string;
  hover: string;
  icon: string;
} {
  switch (status) {
    case 'willPublish':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.WillPublish',
          message: 'Will publish',
        }),
        variant: 'positive',
        default: tokens.green300,
        hover: tokens.green400,
        icon: tokens.green400,
      };
    case 'becomesDraft':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.BecomesDraft',
          message: 'Becomes draft',
        }),
        variant: 'warning',
        default: tokens.orange300,
        hover: tokens.orange400,
        icon: tokens.orange400,
      };
    case 'remainsDraft':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.RemainsDraft',
          message: 'Remains draft',
        }),
        variant: 'warning',
        default: tokens.orange300,
        hover: tokens.orange400,
        icon: tokens.orange400,
      };
    case 'notInRelease':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.NotInRelease',
          message: 'Not in release',
        }),
        variant: 'secondary',
        default: tokens.gray300,
        hover: tokens.gray400,
        icon: tokens.gray400,
      };
    case 'published':
      return {
        label: t({
          id: 'FieldEditors.Shared.ReleaseEntityStatusBadge.Published',
          message: 'Published',
        }),
        variant: 'positive',
        default: tokens.green300,
        hover: tokens.green400,
        icon: tokens.green400,
      };
  }
}
