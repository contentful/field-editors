import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

const styles = {
  container: css({
    position: 'absolute',
    zIndex: tokens.zIndexNotification,
    fontWeight: tokens.fontWeightNormal,
    fontStyle: 'normal',
    fontFamily: tokens.fontStackPrimary,
    'ul, ol, dl': {
      listStyle: 'none',
      marginLeft: 0,
    },
  }),
  menuPoper: css({
    zIndex: tokens.zIndexModal,
  }),
  menuContent: css({
    width: '400px',
    maxHeight: '300px',
  }),
  menuList: css({
    overflow: 'auto',
    maxHeight: '200px',
  }),
  menuItem: css({
    display: 'block',
    width: '100%',
    background: 'none',
    border: 0,
    margin: 0,
    outline: 'none',
    fontSize: tokens.fontSizeM,
    lineHeight: tokens.lineHeightM,
    fontWeight: tokens.fontWeightNormal,
    position: 'relative',
    textAlign: 'left',
    padding: `${tokens.spacingXs} ${tokens.spacingM}`,
    wordBreak: 'break-word',
    whiteSpace: 'break-spaces',
    cursor: 'pointer',
    hyphens: 'auto',
    minWidth: '150px',
    textDecoration: 'none',
    color: tokens.gray800,
    '&:hover': {
      backgroundColor: tokens.gray100,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'auto',
    },
  }),
  menuItemSelected: css({
    boxShadow: `inset ${tokens.glowPrimary}`,
    borderRadius: tokens.borderRadiusMedium,
  }),
  menuDivider: css({
    border: 'none',
    width: '100%',
    height: '1px',
    background: tokens.gray300,
    margin: `${tokens.spacingXs} 0`,
  }),
  menuHeader: css({
    zIndex: tokens.zIndexDefault,
    top: 0,
    backgroundColor: tokens.gray100,
    padding: tokens.spacingM,
  }),
  menuFooter: css({
    position: 'sticky',
    bottom: 0,
    backgroundColor: tokens.gray100,
    padding: tokens.spacingM,
  }),
  footerList: css({
    listStyle: 'none',
    color: tokens.gray600,
    fontSize: tokens.fontSizeM,
  }),
  thumbnail: css({
    width: '30px',
    height: '30px',
    objectFit: 'cover',
  }),
};

export default styles;
