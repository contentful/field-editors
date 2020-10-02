import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export const container = css({
  display: 'flex',
  backgroundColor: tokens.colorWhite,
  border: `1px dashed ${tokens.colorElementMid}`,
  borderRadius: '3px',
  justifyContent: 'center',
  padding: tokens.spacing3Xl,
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
