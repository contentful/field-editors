import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

const STYLE_EDITOR_BORDER = `1px solid ${tokens.gray400}`;

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
    overflowY: 'auto',
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
    // We need to reset LIC style due to conflicts between PARAGRAPH styles
    'ul > li > div': {
      margin: 0,
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
    background: tokens.gray100,
    cursor: 'not-allowed',
  }),
  rtl: css({
    direction: 'rtl',
  }),
  ltr: css({
    direction: 'ltr',
  }),
};
