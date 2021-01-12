import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  widthContainer: css({
    maxWidth: '768px',
    marginLeft: 'auto',
    marginRight: 'auto',
  }),

  editGroupsButton: css({
    marginLeft: tokens.spacingXl,
    marginTop: tokens.spacingM,
    marginBottom: tokens.spacingXs,
  }),

  fieldGroupsContainer: css({
    marginTop: tokens.spacingM,
  }),

  collapsibleContainerHeader: css({
    marginLeft: tokens.spacingL,
    marginRight: tokens.spacingL,
    marginBottom: tokens.spacingXs,
  }),

  collapsibleContainerButton: css({
    margin: '0px',
    border: 'none',
    background: 'none',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  collapsibleContainerInfo: css({
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0',
  }),

  icon: css({
    backgroundColor: tokens.colorElementLightest,
    borderRadius: tokens.borderRadiusSmall,
    padding: tokens.spacingXs,
    marginRight: tokens.spacingXs,
  }),

  fieldsContainer: css({
    backgroundColor: tokens.colorElementLightest,
    paddingBottom: tokens.spacingL,
    paddingTop: tokens.spacingL,
  }),

  cardInfo: css({ display: 'flex', alignItems: 'center' }),
  controls: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingM} ${tokens.spacingXl}`,
    borderBottom: `1px solid ${tokens.colorElementMid}`,
  }),
  saveButton: css({
    marginLeft: tokens.spacingS,
  }),
  editor: css({
    background: tokens.colorElementLightest,
    padding: tokens.spacingL,
    marginBottom: tokens.spacingM,
  }),
  card: css({
    marginBottom: tokens.spacingXs,
    paddingTop: tokens.spacingXs,
    paddingBottom: tokens.spacingXs,
    paddingLeft: tokens.spacing2Xs,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 102, // This is to stop the sortable cards disappearing behind their container
  }),
  fieldName: css({
    marginRight: tokens.spacingXs,
    marginLeft: tokens.spacingXs,
    fontWeight: 700,
  }),
  handle: css({
    border: 'none',
    background: 'none',
  }),
  listContainer: css({
    paddingLeft: '0px',
  }),
  formLabel: css({ marginTop: tokens.spacingM }),

  fieldGroupConfigurationTextLink: css({
    marginRight: tokens.spacingS,
  }),

  errorList: css({ listStyle: 'none', paddingLeft: '0' }),

  error: css({
    color: tokens.colorRedBase,
    fontSize: tokens.fontSizeM,
  }),
};

export default styles;
