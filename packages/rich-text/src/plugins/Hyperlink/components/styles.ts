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
  iconButton: css({
    padding: `${tokens.spacing2Xs} ${tokens.spacingXs}`,
  }),
  openLink: css({
    display: 'inline-block',
    marginLeft: tokens.spacingXs,
    marginRight: tokens.spacingXs,
    maxWidth: '22ch',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  popover: css({
    zIndex: tokens.zIndexModal,
  }),
  hyperlink: css({
    position: 'relative',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    fontSize: 'inherit !important',
    display: 'inline !important',
    direction: 'inherit',
    '&:hover': {
      fill: tokens.gray900,
      textDecoration: 'none',
    },
    '&:focus': {
      fill: tokens.gray900,
    },
    span: {
      display: 'inline',
    },
  }),
};
