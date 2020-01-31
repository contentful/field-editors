import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';

export const validationRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: tokens.fontSizeM,
  marginTop: tokens.spacingXs,
  color: tokens.colorTextMid
});

export const inputContainer = css({
  position: 'relative'
});

export const input = css({
  input: {
    paddingLeft: '40px'
  }
});

export const icon = css({
  position: 'absolute',
  left: '10px',
  top: '8px',
  zIndex: 2,
  width: '25px',
  height: '25px',
  fill: tokens.colorElementDarkest
});
