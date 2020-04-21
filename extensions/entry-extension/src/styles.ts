import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  heading: css({
    display: 'flex',
    justifyContent: 'space-between',
    margin: tokens.spacingL
  }),

  button: css({
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0'
  }),

  icon: css({
    backgroundColor: tokens.colorElementLightest,
    borderRadius: '2px',
    padding: '3px',
    marginRight: tokens.spacingXs
  }),

  fieldsContainer: css({
    backgroundColor: tokens.colorElementLightest,
    padding: tokens.spacingL
  }),

  fieldWrapper: css({
    borderLeft: '3px solid #c5d2d8',
    paddingLeft: '1em',
    marginBottom: '29px',
    marginTop: '19px',
    transition: 'border-color 0.18s linear',
    '&:focus-within': {
      borderColor: tokens.colorPrimary
    }
  }),

  cardInfo: css({ display: 'flex', alignItems: 'center' }),
  controls: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingM} ${tokens.spacingXl}`,
    borderBottom: `1px solid ${tokens.colorElementMid}`
  }),
  saveButton: css({
    marginLeft: tokens.spacingS
  }),
  editor: css({
    background: tokens.colorElementLightest,
    padding: tokens.spacingL,
    marginBottom: tokens.spacingM
  }),
  dropDownTrigger: css({
    width: '100%'
  }),
  card: css({
    marginBottom: tokens.spacingXs,
    paddingTop: tokens.spacingXs,
    paddingBottom: tokens.spacingXs,
    paddingLeft: tokens.spacing2Xs,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 102 // This is to stop the sortable cards disappearing behind their container
  }),
  fieldName: css({
    marginRight: tokens.spacingXs,
    marginLeft: tokens.spacingXs,
    fontWeight: 700
  }),
  handle: css({
    border: 'none',
    background: 'none'
  }),
  listContainer: css({
    paddingLeft: '0px'
  }),
  formLabel: css({ marginTop: tokens.spacingS })
};

export default styles;
