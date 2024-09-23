import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const container = css({
  display: 'flex',
  border: `1px dashed ${tokens.gray500}`,
  borderRadius: tokens.borderRadiusMedium,
  justifyContent: 'center',
  padding: tokens.spacingXl,
});

export const action = css({
  textDecoration: 'none',
  fontWeight: 'bold',
});

export const chevronIcon = css({
  float: 'right',
  marginLeft: tokens.spacingXs,
  marginRight: -tokens.spacing2Xs,
});
