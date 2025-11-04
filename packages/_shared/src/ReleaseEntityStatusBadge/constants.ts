import tokens from '@contentful/f36-tokens';

export const RELEASE_BADGES = {
  willPublish: {
    label: 'Will publish',
    variant: 'positive',
    default: tokens.green300,
    hover: tokens.green400,
    icon: tokens.green400,
  },
  published: {
    label: 'Published',
    variant: 'positive',
    default: tokens.green300,
    hover: tokens.green400,
    icon: tokens.green400,
  },
  becomesDraft: {
    label: 'Becomes draft',
    variant: 'warning',
    default: tokens.orange300,
    hover: tokens.orange400,
    icon: tokens.orange400,
  },
  remainsDraft: {
    label: 'Remains draft',
    variant: 'warning',
    default: tokens.orange300,
    hover: tokens.orange400,
    icon: tokens.orange400,
  },
  notInRelease: {
    label: 'Not in release',
    variant: 'secondary',
    default: tokens.gray300,
    hover: tokens.gray400,
    icon: tokens.gray400,
  },
} as const;
