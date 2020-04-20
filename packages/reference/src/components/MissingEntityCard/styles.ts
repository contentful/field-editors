import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export const card = css({
  position: 'relative'
});

export const squareCard = css({
  display: 'flex',
  alignItems: 'center',
  width: '135px',
  height: '160px',
  textAlign: 'center'
});

export const close = css({
  position: 'absolute',
  top: tokens.spacingS,
  right: tokens.spacingS
});
