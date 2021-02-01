import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { SpaceAPI } from '@contentful/app-sdk';
import { AssetCard, Icon } from '@contentful/forma-36-react-components';
import { renderActions, renderAssetInfo } from './AssetCardActions';
import { File, Asset } from '../../types';
import { entityHelpers } from '@contentful/field-editor-shared';
import { MissingEntityCard, ScheduledIconWithTooltip } from '../../components';

// @ts-expect-error
import mimetype from '@contentful/mimetype';

const groupToIconMap = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  richtext: 'richtext',
  presentation: 'presentation',
  spreadsheet: 'spreadsheet',
  pdfdocument: 'pdf',
  archive: 'archive',
  plaintext: 'plaintext',
  code: 'code',
  markup: 'markup',
};

const styles = {
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs,
  }),
};

export interface WrappedAssetCardProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  asset: Asset;
  localeCode: string;
  defaultLocaleCode: string;
  getAssetUrl?: (assetId: string) => string;
  className?: string;
  isSelected?: boolean;
  isDisabled: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  size: 'default' | 'small';
  cardDragHandle?: React.ReactElement;
  isClickable: boolean;
}

const defaultProps = {
  isClickable: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFileType(file?: File): any {
  if (!file) {
    return 'archive';
  }

  const groupName: keyof typeof groupToIconMap = mimetype.getGroupLabel({
    type: file.contentType,
    fallbackFileName: file.fileName,
  });

  return groupToIconMap[groupName] || 'archive';
}

export const WrappedAssetCard = (props: WrappedAssetCardProps) => {
  const {
    className,
    onEdit,
    getAssetUrl,
    onRemove,
    size,
    isDisabled,
    isSelected,
    isClickable,
  } = props;

  const status = entityHelpers.getEntryStatus(props.asset.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard
        entityType="Asset"
        asSquare
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
    <AssetCard
      type={getFileType(entityFile)}
      title={entityTitle}
      className={className}
      selected={isSelected}
      href={getAssetUrl ? getAssetUrl(props.asset.sys.id) : undefined}
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
      src={
        entityFile && entityFile.url
          ? size === 'small'
            ? `${entityFile.url}?w=150&h=150&fit=thumb`
            : `${entityFile.url}?h=300`
          : ''
      }
      // @ts-expect-error
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (!isClickable) return;
        onEdit && onEdit();
      }}
      cardDragHandleComponent={props.cardDragHandle}
      withDragHandle={!!props.cardDragHandle}
      dropdownListElements={
        <React.Fragment>
          {renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove })}
          {entityFile ? renderAssetInfo({ entityFile }) : <span />}
        </React.Fragment>
      }
      size={size}
    />
  );
};

WrappedAssetCard.defaultProps = defaultProps;
