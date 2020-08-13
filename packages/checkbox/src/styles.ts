import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export const form = css({
  marginTop: tokens.spacingS,
});

export const rightToLeft = css({
  direction: 'rtl',
});

export const invalidText = css({
  color: tokens.colorRedMid,
  marginLeft: tokens.spacing2Xs,
});

export const removeBtn = css({
  marginLeft: tokens.spacingL,
});
