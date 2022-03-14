import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const styles = {
  hyperlinkWrapper: css({
    display: 'inline',
    position: 'static',
    a: {
      fontSize: 'inherit !important',
    },
  }),
  hyperlink: css({
    fontSize: 'inherit !important',
    display: 'inline !important',
    '&:hover': {
      fill: tokens.gray900,
    },
    '&:focus': {
      fill: tokens.gray900,
    },
  }),
};
