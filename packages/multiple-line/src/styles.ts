import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const validationRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: tokens.fontSizeM,
  marginTop: tokens.spacingXs,
  color: tokens.gray700,
});

export const rightToLeft = css({
  direction: 'rtl',
});
