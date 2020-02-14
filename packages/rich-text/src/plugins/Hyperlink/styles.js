import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export default {
  tooltipContainer: css({
    display: 'inline',
    position: 'relative'
  }),
  hyperlinkWrapper: css({
    display: 'inline',
    position: 'static',
    a: {
      fontSize: 'inherit !important'
    }
  }),
  hyperlink: css({
    fontSize: 'inherit !important',
    display: 'inline !important',
    '&:hover': {
      fill: tokens.textColorDark
    },
    '&:focus': {
      fill: tokens.textColorDark
    }
  }),
  hyperlinkIEFallback: css({
    color: '#1683d0',
    textDecoration: 'underline'
  }),
  // TODO: use these styles once we can use the icon
  hyperlinkIcon: css({
    position: 'relative',
    top: '4px',
    height: '14px',
    margin: '0 -2px 0 -1px',
    '-webkit-transition': 'fill 100ms ease-in-out',
    transition: 'fill 100ms ease-in-out',
    '&:hover': {
      fill: tokens.textColorDark
    },
    '&:focus': {
      fill: tokens.textColorDark
    }
  })
};
