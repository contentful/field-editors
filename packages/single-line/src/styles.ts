import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const validationRow = (withValidation: boolean) =>
  css({
    display: 'flex',
    justifyContent: withValidation ? 'space-between' : 'flex-end',
    fontSize: tokens.fontSizeM,
    marginTop: tokens.spacingXs,
    color: tokens.gray500,
  });

export const rightToLeft = css({
  direction: 'rtl',
});
