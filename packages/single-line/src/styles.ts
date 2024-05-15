import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const counterRow = css({
  marginLeft: tokens.spacingS,
  fontSize: tokens.fontSizeM,
  marginTop: tokens.spacingXs,
  color: tokens.gray500,
  position: 'absolute',
  right: 0,
  bottom: '-28px',
});

export const wrapper = css({
  // This allows any help text to be displayed inline with the char counter
  // marginBottom: '-28px',
  marginBottom: tokens.spacingXs,
});

export const rightToLeft = css({
  direction: 'rtl',
});
