import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export const container = css({
  display: 'flex',
  width: '100%',
  marginTop: tokens.spacingS,
});

// TODO: Should height match card depending on
//  "link" vs. "card" layout appearance?
export const spaciousContainer = css({
  display: 'flex',
  backgroundColor: tokens.colorWhite,
  border: `1px dashed ${tokens.colorElementMid}`,
  borderRadius: '3px',
  justifyContent: 'center',
  padding: tokens.spacing3Xl,
});

export const separator = css({
  marginRight: tokens.spacingXl,
});

export const chevronIcon = css({
  float: 'right',
  marginLeft: tokens.spacingXs,
  marginRight: -tokens.spacing2Xs,
});
