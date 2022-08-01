import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const styles = {
  container: css({
    position: 'relative',
  }),
  controlsWrapper: css({
    position: 'absolute',
    top: '1px',
    right: '1px',
    width: tokens.spacingL,
    height: 'calc(100% - 2px)',
    display: 'flex',
    flexDirection: 'column',
  }),
  control: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
    cursor: 'pointer',
    padding: 0,
    margin: 0,
    outline: 'none',
    border: `0 solid ${tokens.gray300}`,
    background: 'none',
    borderLeftWidth: '1px',

    '&:first-of-type': {
      borderTopRightRadius: tokens.borderRadiusMedium,
    },

    '&:last-of-type': {
      borderTopWidth: '1px',
      borderBottomRightRadius: tokens.borderRadiusMedium,
    },

    svg: {
      fill: tokens.gray600,
    },

    '&:active': {
      background: tokens.gray300,
    },
  }),
  input: css({
    paddingRight: tokens.spacingXl,
  }),
};
