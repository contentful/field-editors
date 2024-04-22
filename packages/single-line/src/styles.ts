import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const counterRow = css({
  float: 'right',
  marginLeft: tokens.spacingS,
  fontSize: tokens.fontSizeM,
  marginTop: tokens.spacingXs,
  color: tokens.gray500,
});

export const rightToLeft = css({
  direction: 'rtl',
});
