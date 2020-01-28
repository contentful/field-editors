import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export const validationRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: tokens.fontSizeM,
  marginTop: tokens.spacingXs,
  color: tokens.colorTextMid
});

export const rightToLeft = css({
  direction: 'rtl'
});
