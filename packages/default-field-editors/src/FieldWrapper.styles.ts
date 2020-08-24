import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

export const styles = {
  withFocusBar: css({
    marginLeft: tokens.spacingL,
    marginRight: tokens.spacingL,
    marginBottom: '29px',
    marginTop: '19px',
    paddingLeft: tokens.spacingM,
    borderLeft: `3px solid ${tokens.colorElementMid}`,
    transition: 'border-color 0.18s linear',
    '&:focus-within': {
      borderColor: tokens.colorPrimary,
    },
    '&[aria-invalid="true"]': {
      borderLeftColor: tokens.colorRedMid,
    },
  }),
  label: css({
    display: 'flex',
    width: '100%',
    maxWidth: '800px',
    color: tokens.colorTextLightest,
    fontSize: tokens.fontSizeM,
    fontWeight: parseInt(tokens.fontWeightNormal, 10),
    lineHeight: tokens.lineHeightDefault,
    whiteSpace: 'pre-wrap',
  }),
  helpText: css({
    margin: `${tokens.spacingXs} 0`,
    fontStyle: 'italic',
  }),
};
