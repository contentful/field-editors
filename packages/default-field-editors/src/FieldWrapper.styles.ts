import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

export const styles = {
  withFocusBar: css({
    marginLeft: tokens.spacingL,
    marginRight: tokens.spacingL,
    marginBottom: '29px',
    marginTop: '19px',
    paddingLeft: tokens.spacingM,
    borderLeft: `3px solid ${tokens.gray300}`,
    transition: 'border-color 0.18s linear',
    '&:focus-within': {
      borderColor: tokens.colorPrimary,
    },
    '&[aria-invalid="true"]': {
      borderLeftColor: tokens.red500,
    },
  }),
  label: css({
    display: 'flex',
    width: '100%',
    maxWidth: '800px',
    color: tokens.gray500,
    fontSize: tokens.fontSizeM,
    fontWeight: tokens.fontWeightNormal,
    lineHeight: tokens.lineHeightDefault,
    whiteSpace: 'pre-wrap',
  }),
  helpText: css({
    margin: `${tokens.spacingXs} 0`,
    fontStyle: 'italic',
  }),
};
