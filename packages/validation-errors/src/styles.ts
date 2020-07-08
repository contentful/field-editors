import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export const errorList = css({
  wordWrap: 'break-word',
  marginTop: tokens.spacingS,
  marginBottom: 0,
  color: tokens.colorRedMid,
});

export const errorItem = css({
  listStyleType: 'disc',
  marginLeft: tokens.spacingM,
  fontWeight: Number(tokens.fontWeightDemiBold),
});
