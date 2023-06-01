import * as React from 'react';

import { EntryCard } from '@contentful/f36-components';
import { ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { entityHelpers, isValidImage, SpaceAPI } from '@contentful/field-editor-shared';
import { css } from 'emotion';

import { AssetThumbnail, MissingEntityCard, ScheduledIconWithTooltip } from '../../components';
import { Asset, RenderDragFn } from '../../types';
import { renderActions, renderAssetInfo } from './AssetCardActions';

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
  renderDragHandle?: RenderDragFn;
}

export const WrappedAssetLink = (props: WrappedAssetLinkProps) => {
  const { className, href, onEdit, onRemove, isDisabled } = props;

  // @ts-expect-error
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
      as={href ? 'a' : 'article'}
      contentType="Asset"
      title={entityTitle}
      className={className}
      href={href}
      size="small"
      status={status}
      thumbnailElement={
        entityFile && isValidImage(entityFile) ? <AssetThumbnail file={entityFile} /> : undefined
      }
      icon={
        <ScheduledIconWithTooltip
          getEntityScheduledActions={props.getEntityScheduledActions}
          entityType="Asset"
          entityId={props.asset.sys.id}
        >
          <ClockIcon
            className={styles.scheduleIcon}
            size="small"
            variant="muted"
            testId="schedule-icon"
          />
        </ScheduledIconWithTooltip>
      }
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onEdit();
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && onEdit) {
          e.preventDefault();
          onEdit();
        }
      }}
      dragHandleRender={props.renderDragHandle}
      withDragHandle={!!props.renderDragHandle}
      actions={[
        renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove }),
        entityFile ? renderAssetInfo({ entityFile }) : null,
      ].filter((item) => item)}
    />
  );
};
