import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { EntryCard, Icon } from '@contentful/forma-36-react-components';
import { renderActions, renderAssetInfo } from './AssetCardActions';
import { Asset } from '../../types';
import { entityHelpers, SpaceAPI } from '@contentful/field-editor-shared';
import { MissingEntityCard, ScheduledIconWithTooltip } from '../../components';

const styles = {
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs,
  }),
};

export interface WrappedAssetLinkProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  asset: Asset;
  localeCode: string;
  defaultLocaleCode: string;
  href?: string;
  className?: string;
  isDisabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
  cardDragHandle?: React.ReactElement;
}

export const WrappedAssetLink = (props: WrappedAssetLinkProps) => {
  const { className, href, onEdit, onRemove, isDisabled } = props;

  const status = entityHelpers.getEntryStatus(props.asset.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard
        entityType="Asset"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const entityTitle = entityHelpers.getAssetTitle({
    asset: props.asset,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const entityFile = props.asset.fields.file
    ? props.asset.fields.file[props.localeCode] || props.asset.fields.file[props.defaultLocaleCode]
    : undefined;

  return (
    <EntryCard
      contentType="Asset"
      title={entityTitle}
      className={className}
      href={href}
      size="small"
      status={status}
      statusIcon={
        <ScheduledIconWithTooltip
          getEntityScheduledActions={props.getEntityScheduledActions}
          entityType="Asset"
          entityId={props.asset.sys.id}>
          <Icon
            className={styles.scheduleIcon}
            icon="Clock"
            size="small"
            color="muted"
            testId="schedule-icon"
          />
        </ScheduledIconWithTooltip>
      }
      onClick={(e) => {
        e.preventDefault();
        onEdit();
      }}
      cardDragHandleComponent={props.cardDragHandle}
      withDragHandle={!!props.cardDragHandle}
      dropdownListElements={
        <React.Fragment>
          {renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove })}
          {entityFile ? renderAssetInfo({ entityFile }) : <span />}
        </React.Fragment>
      }
    />
  );
};
