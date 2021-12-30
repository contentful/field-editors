import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';

export const container = css({
  display: 'flex',
  width: '100%',
  marginTop: tokens.spacingS,
});

export const separator = css({
  marginRight: tokens.spacingXl,
});
