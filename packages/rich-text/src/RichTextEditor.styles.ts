import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const STYLE_EDITOR_BORDER = `1px solid ${tokens.colorElementDark}`;

export const styles = {
  root: css({
    position: 'relative',
  }),
  editor: css({
    borderRadius: `0 0 ${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium}`,
    border: STYLE_EDITOR_BORDER,
    borderTop: 0,
    padding: '20px',
    fontSize: tokens.spacingM,
    fontFamily: tokens.fontStackPrimary,
    minHeight: '400px',
    background: tokens.colorWhite,
    outline: 'none',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    webkitUserModify: 'read-write-plaintext-only',
    a: {
      span: {
        cursor: 'not-allowed',
        '&:hover': {
          cursor: 'not-allowed',
        },
      },
    },
  }),
  hiddenToolbar: css({
    borderTop: STYLE_EDITOR_BORDER,
  }),
  enabled: css({
    background: tokens.colorWhite,
    a: {
      span: {
        cursor: 'pointer',
        '&:hover': {
          cursor: 'pointer',
        },
      },
    },
  }),
  disabled: css({
    background: tokens.colorElementLightest,
  }),
};
