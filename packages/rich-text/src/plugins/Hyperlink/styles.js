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
      'font-size': 'inherit'
    }
  }),
  hyperlink: css({
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
    'text-decoration': 'underline'
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
