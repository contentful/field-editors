import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const validationRow = css({
  display: 'flex',
  flexDirection: 'row-reverse',
  fontSize: tokens.fontSizeM,
  marginTop: tokens.spacingXs,
  color: tokens.gray700,
});

export const inputContainer = css({
  position: 'relative',
});

export const input = css({
  paddingLeft: '40px',
});

export const icon = css({
  position: 'absolute',
  left: '10px',
  top: '8px',
  zIndex: 2,
  width: '25px',
  height: '25px',
  fill: tokens.gray500,
});

export const spinnerContainer = css({
  position: 'absolute',
  zIndex: 2,
  right: '8px',
  top: '8px',
});

export const uniqueValidationError = css({
  marginTop: tokens.spacingS,
});
