import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const errorList = css({
  padding: 0,
  wordWrap: 'break-word',
  marginTop: tokens.spacingXs,
  color: tokens.red500,
  listStyleType: 'none',
});

export const errorMessage = css({
  display: 'inline-flex',
  flexDirection: 'column',
  marginLeft: tokens.spacingXs,
});

export const errorItem = css({
  display: 'flex',
});

export const entryLink = css({
  fontWeight: Number(tokens.fontWeightDemiBold),
});
